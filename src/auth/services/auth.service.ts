import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import {
  RegistrationLog,
  RegistrationLogDocument,
} from '../schemas/registration-log.schema';
import { OtpService } from './otp.service';
import { NotificationService } from './notification.service';
import { RateLimitService } from './rate-limit.service';
import { RegisterDto, VerifyOtpDto, ResendOtpDto } from '../dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RegistrationLog.name)
    private logModel: Model<RegistrationLogDocument>,
    private otpService: OtpService,
    private notificationService: NotificationService,
    private rateLimitService: RateLimitService,
  ) {}

  async register(dto: RegisterDto, ipAddress: string, userAgent: string) {
    // Check rate limit
    await this.rateLimitService.checkRegisterLimit(ipAddress);

    // Check duplicates
    const existingUser = await this.userModel.findOne({
      $or: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email đã được sử dụng');
      }
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.userModel.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      fullName: dto.fullName,
      status: 'pending',
    });

    // Generate and send OTP
    const { code, expiresAt } = await this.otpService.generateOtp(
      user._id.toString(),
      'email',
    );

    await this.notificationService.sendOtpEmail(dto.email, code, 10);

    // Log event
    await this.logModel.create({
      userId: user._id,
      email: dto.email,
      phone: dto.phone,
      eventType: 'register',
      ipAddress,
      userAgent,
    });

    return {
      userId: user._id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      status: user.status,
      expiresAt,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    // Check rate limit
    await this.rateLimitService.checkVerifyLimit(dto.userId);

    // Find user
    const user = await this.userModel.findById(dto.userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (user.status === 'verified') {
      throw new BadRequestException('Tài khoản đã được xác thực');
    }

    // Validate OTP
    const result = await this.otpService.validateOtp(dto.userId, dto.code);

    if (!result.valid) {
      // Log failed attempt
      await this.logModel.create({
        userId: user._id,
        email: user.email,
        phone: user.phone,
        eventType: 'verify_failed',
        metadata: { attemptsLeft: result.attemptsLeft },
      });

      if (result.attemptsLeft === 0) {
        throw new BadRequestException(
          'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.',
        );
      }

      throw new BadRequestException({
        message: 'Mã OTP không chính xác',
        attemptsLeft: result.attemptsLeft,
      });
    }

    // Update user status
    user.status = 'verified';
    await user.save();

    // Log success
    await this.logModel.create({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      eventType: 'verify_success',
    });

    return {
      userId: user._id,
      email: user.email,
      status: user.status,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    // Check rate limits
    await this.rateLimitService.checkResendLimit(dto.userId);

    // Find user
    const user = await this.userModel.findById(dto.userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (user.status === 'verified') {
      throw new BadRequestException('Tài khoản đã được xác thực');
    }

    // Invalidate old OTPs
    await this.otpService.invalidateOldCodes(dto.userId);

    // Generate new OTP
    const { code, expiresAt } = await this.otpService.generateOtp(
      dto.userId,
      dto.type,
    );

    // Send notification
    if (dto.type === 'email') {
      await this.notificationService.sendOtpEmail(user.email, code, 10);
    } else {
      await this.notificationService.sendOtpSms(user.phone, code);
    }

    // Log event
    await this.logModel.create({
      userId: user._id,
      email: user.email,
      phone: user.phone,
      eventType: 'resend_otp',
      metadata: { type: dto.type },
    });

    const nextResendAt = new Date(Date.now() + 60 * 1000);

    return {
      expiresAt,
      nextResendAt,
    };
  }
}
