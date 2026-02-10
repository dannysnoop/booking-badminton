import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroupBooking, GroupBookingDocument, GroupBookingStatus, SplitMethod } from '../schemas/group-booking.schema';
import { GroupMember, GroupMemberDocument, MemberStatus, MemberPaymentStatus } from '../schemas/group-member.schema';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { InviteMembersDto, RespondToInviteDto, UpdatePaymentStatusDto } from '../dto/booking.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(GroupBooking.name) private groupBookingModel: Model<GroupBookingDocument>,
    @InjectModel(GroupMember.name) private groupMemberModel: Model<GroupMemberDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

  async inviteMembers(groupBookingId: string, inviteMembersDto: InviteMembersDto, hostId: string) {
    const groupBooking = await this.groupBookingModel.findById(groupBookingId);

    if (!groupBooking) {
      throw new NotFoundException('Group booking không tồn tại');
    }

    if (groupBooking.hostId.toString() !== hostId) {
      throw new ForbiddenException('Chỉ host mới có thể mời thành viên');
    }

    if (groupBooking.status !== GroupBookingStatus.OPEN) {
      throw new BadRequestException('Group booking không còn mở cho lời mời');
    }

    // Check current member count
    const currentMemberCount = await this.groupMemberModel.countDocuments({
      groupBookingId,
      status: { $in: [MemberStatus.INVITED, MemberStatus.ACCEPTED] },
    });

    if (currentMemberCount + inviteMembersDto.userIds.length > groupBooking.maxMembers) {
      throw new BadRequestException('Vượt quá số lượng thành viên tối đa');
    }

    // Get booking to calculate member amounts
    const booking = await this.bookingModel.findById(groupBooking.bookingId);
    if (!booking) {
      throw new NotFoundException('Booking không tồn tại');
    }

    const memberAmount = this.calculateMemberAmount(
      booking.totalPrice,
      groupBooking.maxMembers,
      groupBooking.splitMethod,
    );

    // Create invitations
    const invitations = [];
    for (const userId of inviteMembersDto.userIds) {
      // Check if already invited
      const existingMember = await this.groupMemberModel.findOne({
        groupBookingId,
        userId,
      });

      if (existingMember) {
        continue; // Skip if already invited
      }

      const member = await this.groupMemberModel.create({
        groupBookingId,
        userId,
        status: MemberStatus.INVITED,
        amountToPay: memberAmount,
        paymentStatus: MemberPaymentStatus.PENDING,
        invitedAt: new Date(),
        invitedBy: hostId,
      });

      invitations.push(member);

      // TODO: Send notification based on inviteMethod (SMS, IN_APP, LINK)
    }

    return {
      invited: invitations.length,
      inviteLink: groupBooking.inviteLink,
      inviteCode: groupBooking.inviteCode,
    };
  }

  async joinByInviteCode(inviteCode: string, userId: string) {
    const groupBooking = await this.groupBookingModel.findOne({ inviteCode });

    if (!groupBooking) {
      throw new NotFoundException('Invite code không hợp lệ');
    }

    if (groupBooking.status !== GroupBookingStatus.OPEN) {
      throw new BadRequestException('Group booking không còn mở');
    }

    // Check if already a member
    const existingMember = await this.groupMemberModel.findOne({
      groupBookingId: groupBooking._id,
      userId,
    });

    if (existingMember) {
      if (existingMember.status === MemberStatus.ACCEPTED) {
        throw new BadRequestException('Bạn đã tham gia group này rồi');
      }
      // If previously invited, just update status
      existingMember.status = MemberStatus.ACCEPTED;
      existingMember.respondedAt = new Date();
      await existingMember.save();
      return this.formatMemberResponse(existingMember);
    }

    // Check member count
    const currentMemberCount = await this.groupMemberModel.countDocuments({
      groupBookingId: groupBooking._id,
      status: { $in: [MemberStatus.INVITED, MemberStatus.ACCEPTED] },
    });

    if (currentMemberCount >= groupBooking.maxMembers) {
      throw new BadRequestException('Group đã đầy');
    }

    // Get booking to calculate amount
    const booking = await this.bookingModel.findById(groupBooking.bookingId);
    const memberAmount = this.calculateMemberAmount(
      booking.totalPrice,
      groupBooking.maxMembers,
      groupBooking.splitMethod,
    );

    // Create new member
    const member = await this.groupMemberModel.create({
      groupBookingId: groupBooking._id,
      userId,
      status: MemberStatus.ACCEPTED,
      amountToPay: memberAmount,
      paymentStatus: MemberPaymentStatus.PENDING,
      invitedAt: new Date(),
      respondedAt: new Date(),
      invitedBy: groupBooking.hostId,
    });

    // Check if group is now full
    if (currentMemberCount + 1 >= groupBooking.maxMembers) {
      groupBooking.status = GroupBookingStatus.FULL;
      await groupBooking.save();
    }

    return this.formatMemberResponse(member);
  }

  async respondToInvite(groupBookingId: string, userId: string, respondDto: RespondToInviteDto) {
    const member = await this.groupMemberModel.findOne({
      groupBookingId,
      userId,
    });

    if (!member) {
      throw new NotFoundException('Bạn chưa được mời vào group này');
    }

    if (member.status !== MemberStatus.INVITED) {
      throw new BadRequestException('Bạn đã phản hồi lời mời này rồi');
    }

    member.status = respondDto.response === 'ACCEPTED' ? MemberStatus.ACCEPTED : MemberStatus.DECLINED;
    member.respondedAt = new Date();
    await member.save();

    // If accepted, check if group is full
    if (respondDto.response === 'ACCEPTED') {
      const groupBooking = await this.groupBookingModel.findById(groupBookingId);
      const acceptedCount = await this.groupMemberModel.countDocuments({
        groupBookingId,
        status: MemberStatus.ACCEPTED,
      });

      if (acceptedCount >= groupBooking.maxMembers) {
        groupBooking.status = GroupBookingStatus.FULL;
        await groupBooking.save();
      }
    }

    return this.formatMemberResponse(member);
  }

  async getGroupMembers(groupBookingId: string, userId: string) {
    // Verify user is a member
    const member = await this.groupMemberModel.findOne({
      groupBookingId,
      userId,
    });

    if (!member) {
      throw new ForbiddenException('Bạn không phải thành viên của group này');
    }

    const members = await this.groupMemberModel
      .find({ groupBookingId })
      .populate('userId', 'fullName email avatarUrl')
      .sort({ invitedAt: 1 })
      .lean()
      .exec();

    return members.map((m) => this.formatMemberResponse(m));
  }

  async updateMemberPaymentStatus(
    groupBookingId: string,
    memberId: string,
    updateDto: UpdatePaymentStatusDto,
    userId: string,
  ) {
    const groupBooking = await this.groupBookingModel.findById(groupBookingId);

    if (!groupBooking) {
      throw new NotFoundException('Group booking không tồn tại');
    }

    // Only host can update payment status
    if (groupBooking.hostId.toString() !== userId) {
      throw new ForbiddenException('Chỉ host mới có thể cập nhật trạng thái thanh toán');
    }

    const member = await this.groupMemberModel.findById(memberId);

    if (!member) {
      throw new NotFoundException('Member không tồn tại');
    }

    member.paymentStatus = updateDto.paymentStatus as MemberPaymentStatus;
    if (updateDto.paymentStatus === 'PAID') {
      member.paidAt = new Date();
    }
    await member.save();

    return this.formatMemberResponse(member);
  }

  async removeMember(groupBookingId: string, memberId: string, hostId: string) {
    const groupBooking = await this.groupBookingModel.findById(groupBookingId);

    if (!groupBooking) {
      throw new NotFoundException('Group booking không tồn tại');
    }

    if (groupBooking.hostId.toString() !== hostId) {
      throw new ForbiddenException('Chỉ host mới có thể xóa thành viên');
    }

    const member = await this.groupMemberModel.findById(memberId);

    if (!member) {
      throw new NotFoundException('Member không tồn tại');
    }

    if (member.userId.toString() === hostId) {
      throw new BadRequestException('Host không thể tự xóa mình');
    }

    member.status = MemberStatus.REMOVED;
    await member.save();

    // If group was full, reopen it
    if (groupBooking.status === GroupBookingStatus.FULL) {
      groupBooking.status = GroupBookingStatus.OPEN;
      await groupBooking.save();
    }

    return { message: 'Thành viên đã được xóa' };
  }

  private calculateMemberAmount(
    totalPrice: number,
    maxMembers: number,
    splitMethod: SplitMethod,
  ): number {
    switch (splitMethod) {
      case SplitMethod.EQUAL:
        return Math.round(totalPrice / maxMembers);

      case SplitMethod.HOST_PAY_FIRST:
        return 0; // Members pay 0, host pays all first

      case SplitMethod.CUSTOM:
        return Math.round(totalPrice / maxMembers); // Default to equal

      default:
        return Math.round(totalPrice / maxMembers);
    }
  }

  private formatMemberResponse(member: any) {
    return {
      id: member._id || member.id,
      groupBookingId: member.groupBookingId,
      userId: member.userId,
      status: member.status,
      amountToPay: member.amountToPay,
      paymentStatus: member.paymentStatus,
      paidAt: member.paidAt,
      invitedAt: member.invitedAt,
      respondedAt: member.respondedAt,
    };
  }
}

