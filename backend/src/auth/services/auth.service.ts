import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { RegistrationLog } from '../entities/registration-log.entity';
import { RegisterDto } from '../dto/register.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { OtpService } from './otp.service';
import { NotificationService } from './notification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RegistrationLog)
    private logRepo: Repository<RegistrationLog>,
    private otpService: OtpService,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress: string, userAgent: string) {
    // Check duplicate email
    const existingEmail = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'Email đã được sử dụng',
        },
      });
    }

    // Check duplicate phone
    const existingPhone = await this.userRepo.findOne({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException({
        success: false,
        error: {
          code: 'DUPLICATE_PHONE',
          message: 'Số điện thoại đã được sử dụng',
        },
      });
    }

    // Hash password
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create user with status 'pending'
    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      fullName: dto.fullName,
      status: 'pending',
    });

    const savedUser = await this.userRepo.save(user);

    // Generate and send OTP
    const otpCode = await this.otpService.generateOtp(savedUser.id, 'email');
    const expiryMinutes = this.configService.get<number>(
      'OTP_EXPIRY_MINUTES',
      10,
    );

    // Send OTP via email
    await this.notificationService.sendOtpEmail(
      dto.email,
      otpCode,
      expiryMinutes,
    );

    // Log registration event
    const registrationLog = this.logRepo.create({
      userId: savedUser.id,
      email: dto.email,
      phone: dto.phone,
      eventType: 'register',
      ipAddress,
      userAgent,
    });
    await this.logRepo.save(registrationLog);

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    return {
      success: true,
      data: {
        userId: savedUser.id,
        email: savedUser.email,
        phone: savedUser.phone,
        fullName: savedUser.fullName,
        status: savedUser.status,
        expiresAt: expiresAt.toISOString(),
      },
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email/SMS để xác thực tài khoản.',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    // Find user
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Người dùng không tồn tại',
        },
      });
    }

    // Validate OTP
    const validation = await this.otpService.validateOtp(dto.userId, dto.code);

    if (!validation.valid) {
      // Log failed verification
      const failLog = this.logRepo.create({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        eventType: 'verify_failed',
        ipAddress: null,
        userAgent: null,
      });
      await this.logRepo.save(failLog);

      if (validation.error === 'OTP_EXPIRED') {
        throw new BadRequestException({
          success: false,
          error: {
            code: 'OTP_EXPIRED',
            message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
          },
        });
      }

      if (validation.error === 'TOO_MANY_ATTEMPTS') {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'TOO_MANY_ATTEMPTS',
              message:
                'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.',
            },
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new BadRequestException({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Mã OTP không chính xác',
          attemptsLeft: validation.attemptsLeft,
        },
      });
    }

    // Update user status to 'verified'
    user.status = 'verified';
    await this.userRepo.save(user);

    // Log successful verification
    const successLog = this.logRepo.create({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      eventType: 'verify_success',
      ipAddress: null,
      userAgent: null,
    });
    await this.logRepo.save(successLog);

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        status: user.status,
      },
      message: 'Xác thực tài khoản thành công',
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    // Find user
    const user = await this.userRepo.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Người dùng không tồn tại',
        },
      });
    }

    // Check rate limit: 1 request per 60 seconds
    const cooldownSeconds = this.configService.get<number>(
      'OTP_RESEND_COOLDOWN_SECONDS',
      60,
    );
    const recentLog = await this.logRepo.findOne({
      where: {
        userId: user.id,
        eventType: 'resend_otp',
        createdAt: MoreThan(new Date(Date.now() - cooldownSeconds * 1000)),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (recentLog) {
      const elapsedSeconds = Math.floor(
        (Date.now() - recentLog.createdAt.getTime()) / 1000,
      );
      const retryAfter = cooldownSeconds - elapsedSeconds;

      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Vui lòng đợi ${retryAfter} giây trước khi yêu cầu mã mới`,
            retryAfter,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check max resends per day (5 times)
    const maxResendsPerDay = this.configService.get<number>(
      'OTP_MAX_RESENDS_PER_DAY',
      5,
    );
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayResends = await this.logRepo.count({
      where: {
        userId: user.id,
        eventType: 'resend_otp',
        createdAt: MoreThan(todayStart),
      },
    });

    if (todayResends >= maxResendsPerDay) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'DAILY_LIMIT_EXCEEDED',
            message: 'Bạn đã vượt quá số lần yêu cầu mã mới trong ngày',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Invalidate old OTPs
    await this.otpService.invalidateOldCodes(user.id);

    // Generate new OTP
    const otpCode = await this.otpService.generateOtp(user.id, dto.type);
    const expiryMinutes = this.configService.get<number>(
      'OTP_EXPIRY_MINUTES',
      10,
    );

    // Send OTP
    if (dto.type === 'email') {
      await this.notificationService.sendOtpEmail(
        user.email,
        otpCode,
        expiryMinutes,
      );
    } else {
      await this.notificationService.sendOtpSms(user.phone, otpCode);
    }

    // Log resend event
    const resendLog = this.logRepo.create({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      eventType: 'resend_otp',
      ipAddress: null,
      userAgent: null,
    });
    await this.logRepo.save(resendLog);

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    const nextResendAt = new Date(Date.now() + cooldownSeconds * 1000);

    return {
      success: true,
      data: {
        expiresAt: expiresAt.toISOString(),
        nextResendAt: nextResendAt.toISOString(),
      },
      message: 'Mã OTP mới đã được gửi',
    };
  }
}
