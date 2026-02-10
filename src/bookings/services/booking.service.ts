import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Booking, BookingDocument, BookingType, BookingStatus, PaymentStatus } from '../schemas/booking.schema';
import { GroupBooking, GroupBookingDocument, SplitMethod, GroupBookingStatus } from '../schemas/group-booking.schema';
import { GroupMember, GroupMemberDocument, MemberStatus, MemberPaymentStatus } from '../schemas/group-member.schema';
import { Court, CourtDocument } from '../../courts/schemas/court.schema';
import { CreateBookingDto, CreateGroupBookingDto, CancelBookingDto } from '../dto/booking.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(GroupBooking.name) private groupBookingModel: Model<GroupBookingDocument>,
    @InjectModel(GroupMember.name) private groupMemberModel: Model<GroupMemberDocument>,
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    private configService: ConfigService,
  ) {}

  async createIndividualBooking(createBookingDto: CreateBookingDto, userId: string) {
    // Validate court exists
    const court = await this.courtModel.findById(createBookingDto.courtId);
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    // Check availability
    const isAvailable = await this.checkAvailability(
      createBookingDto.courtId,
      createBookingDto.bookingDate,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Khung giờ này đã được đặt');
    }

    // Calculate price
    const totalPrice = await this.calculatePrice(
      court,
      createBookingDto.bookingDate,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );

    const booking = await this.bookingModel.create({
      courtId: createBookingDto.courtId,
      userId,
      bookingType: BookingType.INDIVIDUAL,
      bookingDate: new Date(createBookingDto.bookingDate),
      startTime: createBookingDto.startTime,
      endTime: createBookingDto.endTime,
      totalPrice,
      notes: createBookingDto.notes,
    });

    return this.formatBookingResponse(booking);
  }

  async createGroupBooking(createGroupBookingDto: CreateGroupBookingDto, userId: string) {
    // Validate court exists
    const court = await this.courtModel.findById(createGroupBookingDto.courtId);
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    // Check availability
    const isAvailable = await this.checkAvailability(
      createGroupBookingDto.courtId,
      createGroupBookingDto.bookingDate,
      createGroupBookingDto.startTime,
      createGroupBookingDto.endTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Khung giờ này đã được đặt');
    }

    // Calculate price
    const totalPrice = await this.calculatePrice(
      court,
      createGroupBookingDto.bookingDate,
      createGroupBookingDto.startTime,
      createGroupBookingDto.endTime,
    );

    // Create booking
    const booking = await this.bookingModel.create({
      courtId: createGroupBookingDto.courtId,
      userId,
      bookingType: BookingType.GROUP,
      bookingDate: new Date(createGroupBookingDto.bookingDate),
      startTime: createGroupBookingDto.startTime,
      endTime: createGroupBookingDto.endTime,
      totalPrice,
      notes: createGroupBookingDto.notes,
    });

    // Generate invite code and link
    const inviteCode = this.generateInviteCode();
    const baseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const inviteLink = `${baseUrl}/bookings/join/${inviteCode}`;

    // Create group booking
    const groupBooking = await this.groupBookingModel.create({
      bookingId: booking._id,
      hostId: userId,
      maxMembers: createGroupBookingDto.maxMembers,
      splitMethod: createGroupBookingDto.splitMethod as SplitMethod,
      inviteCode,
      inviteLink,
      status: GroupBookingStatus.OPEN,
    });

    // Add host as first member
    const hostAmount = this.calculateMemberAmount(
      totalPrice,
      createGroupBookingDto.maxMembers,
      createGroupBookingDto.splitMethod as SplitMethod,
      true, // is host
    );

    await this.groupMemberModel.create({
      groupBookingId: groupBooking._id,
      userId,
      status: MemberStatus.ACCEPTED,
      amountToPay: hostAmount,
      paymentStatus: MemberPaymentStatus.PENDING,
      invitedAt: new Date(),
      respondedAt: new Date(),
      invitedBy: userId,
    });

    return {
      booking: this.formatBookingResponse(booking),
      groupBooking: this.formatGroupBookingResponse(groupBooking),
      inviteCode,
      inviteLink,
    };
  }

  async findUserBookings(userId: string, status?: string) {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const bookings = await this.bookingModel
      .find(query)
      .sort({ bookingDate: -1, startTime: -1 })
      .populate('courtId', 'name address')
      .lean()
      .exec();

    return bookings.map((booking) => this.formatBookingResponse(booking));
  }

  async findBookingById(bookingId: string, userId: string) {
    const booking = await this.bookingModel
      .findById(bookingId)
      .populate('courtId', 'name address images')
      .lean()
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    // Check if user has access
    if (booking.userId.toString() !== userId) {
      // Check if user is group member
      if (booking.bookingType === BookingType.GROUP) {
        const groupBooking = await this.groupBookingModel.findOne({ bookingId: booking._id });
        if (groupBooking) {
          const member = await this.groupMemberModel.findOne({
            groupBookingId: groupBooking._id,
            userId,
          });
          if (!member) {
            throw new ForbiddenException('Bạn không có quyền xem booking này');
          }
        } else {
          throw new ForbiddenException('Bạn không có quyền xem booking này');
        }
      } else {
        throw new ForbiddenException('Bạn không có quyền xem booking này');
      }
    }

    const result: any = this.formatBookingResponse(booking);

    // If group booking, add group details
    if (booking.bookingType === BookingType.GROUP) {
      const groupBooking = await this.groupBookingModel.findOne({ bookingId: booking._id });
      if (groupBooking) {
        const members = await this.groupMemberModel
          .find({ groupBookingId: groupBooking._id })
          .populate('userId', 'fullName email avatarUrl')
          .lean()
          .exec();

        result.groupBooking = this.formatGroupBookingResponse(groupBooking);
        result.members = members;
      }
    }

    return result;
  }

  async cancelBooking(bookingId: string, userId: string, cancelDto: CancelBookingDto) {
    const booking = await this.bookingModel.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    if (booking.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền hủy booking này');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking đã bị hủy trước đó');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy booking đã hoàn thành');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelReason = cancelDto.reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId as any;
    await booking.save();

    // If group booking, cancel group
    if (booking.bookingType === BookingType.GROUP) {
      await this.groupBookingModel.updateOne(
        { bookingId: booking._id },
        { status: GroupBookingStatus.CANCELLED },
      );
    }

    return { message: 'Booking đã được hủy' };
  }

  private async checkAvailability(
    courtId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const existingBookings = await this.bookingModel.find({
      courtId,
      bookingDate: new Date(bookingDate),
      status: { $nin: [BookingStatus.CANCELLED] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    });

    return existingBookings.length === 0;
  }

  private async calculatePrice(
    court: any,
    bookingDate: string,
    startTime: string,
    endTime: string,
  ): Promise<number> {
    // Simple calculation - in production, consider peak hours, day of week, etc.
    const date = new Date(bookingDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const hourlyRate = isWeekend
      ? court.pricing?.weekendPrice || 100000
      : court.pricing?.weekdayPrice || 80000;

    // Calculate duration in hours
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const durationHours = (endHour + endMinute / 60) - (startHour + startMinute / 60);

    return Math.round(hourlyRate * durationHours);
  }

  private calculateMemberAmount(
    totalPrice: number,
    maxMembers: number,
    splitMethod: SplitMethod,
    isHost: boolean,
  ): number {
    switch (splitMethod) {
      case SplitMethod.EQUAL:
        return Math.round(totalPrice / maxMembers);

      case SplitMethod.HOST_PAY_FIRST:
        return isHost ? totalPrice : 0;

      case SplitMethod.CUSTOM:
        // For custom split, default to equal until custom amounts are set
        return Math.round(totalPrice / maxMembers);

      default:
        return Math.round(totalPrice / maxMembers);
    }
  }

  private generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private formatBookingResponse(booking: any) {
    return {
      id: booking._id || booking.id,
      courtId: booking.courtId,
      userId: booking.userId,
      bookingType: booking.bookingType,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      notes: booking.notes,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  private formatGroupBookingResponse(groupBooking: any) {
    return {
      id: groupBooking._id || groupBooking.id,
      bookingId: groupBooking.bookingId,
      hostId: groupBooking.hostId,
      maxMembers: groupBooking.maxMembers,
      splitMethod: groupBooking.splitMethod,
      inviteCode: groupBooking.inviteCode,
      inviteLink: groupBooking.inviteLink,
      status: groupBooking.status,
      qrCodeUrl: groupBooking.qrCodeUrl,
      createdAt: groupBooking.createdAt,
    };
  }
}

