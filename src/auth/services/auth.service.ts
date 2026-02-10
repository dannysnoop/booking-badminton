import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import {
  RegistrationLog,
  RegistrationLogDocument,
} from '../schemas/registration-log.schema';
import { RefreshToken, RefreshTokenDocument } from '../schemas/refresh-token.schema';
import { LoginLog, LoginLogDocument } from '../schemas/login-log.schema';
import { OtpService } from './otp.service';
import { NotificationService } from './notification.service';
import { RateLimitService } from './rate-limit.service';
import { RegisterDto, VerifyOtpDto, ResendOtpDto, LoginDto, RefreshTokenDto, LogoutDto } from '../dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RegistrationLog.name)
    private logModel: Model<RegistrationLogDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(LoginLog.name)
    private loginLogModel: Model<LoginLogDocument>,
    private otpService: OtpService,
    private notificationService: NotificationService,
    private rateLimitService: RateLimitService,
    private jwtService: JwtService,
    private configService: ConfigService,
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
    const code = '123456'

    await this.notificationService.sendOtpDemoCache( code, 10, user.id);

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

  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const { username, password } = dto;

    // Find user by email or phone
    const user = await this.userModel.findOne({
      $or: [{ email: username }, { phone: username }],
    });

    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    // Check if user is locked
    if (user.isLocked) {
      throw new UnauthorizedException(
        'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần. Vui lòng liên hệ hỗ trợ.',
      );
    }

    // Check if user is verified
    if (user.status !== 'verified') {
      throw new UnauthorizedException('Tài khoản chưa được xác thực');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login count
      user.failedLoginCount += 1;

      // Lock account if exceeded max attempts
      if (user.failedLoginCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
        user.isLocked = true;
        user.lockedAt = new Date();
        await user.save();

        // Log failed login
        await this.loginLogModel.create({
          userId: user._id,
          eventType: 'login_failed',
          ipAddress,
          userAgent,
          metadata: { reason: 'account_locked', attempts: user.failedLoginCount },
        });

        throw new UnauthorizedException(
          'Tài khoản đã bị khóa do đăng nhập sai quá nhiều lần.',
        );
      }

      await user.save();

      // Log failed login
      await this.loginLogModel.create({
        userId: user._id,
        eventType: 'login_failed',
        ipAddress,
        userAgent,
        metadata: { reason: 'invalid_password', attempts: user.failedLoginCount },
      });

      throw new UnauthorizedException(
        `Thông tin đăng nhập không chính xác. Còn ${MAX_FAILED_LOGIN_ATTEMPTS - user.failedLoginCount} lần thử.`,
      );
    }

    // Reset failed login count on successful login
    user.failedLoginCount = 0;
    await user.save();

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

    // Log successful login
    await this.loginLogModel.create({
      userId: user._id,
      eventType: 'login_success',
      ipAddress,
      userAgent,
    });

    const expiresAt = new Date(
      Date.now() + (this.configService.get<number>('JWT_EXPIRES_IN') || 3600) * 1000,
    );

    return {
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async refreshToken(dto: RefreshTokenDto, ipAddress: string, userAgent: string) {
    const { refreshToken } = dto;

    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find refresh token in database
    const storedToken = await this.refreshTokenModel.findOne({
      tokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Find user
    const user = await this.userModel.findById(storedToken.userId);

    if (!user || !user.isActive || user.isLocked || user.status !== 'verified') {
      throw new UnauthorizedException('Tài khoản không hợp lệ');
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

    // Revoke old refresh token
    storedToken.isRevoked = true;
    await storedToken.save();

    // Log token refresh
    await this.loginLogModel.create({
      userId: user._id,
      eventType: 'token_refresh',
      ipAddress,
      userAgent,
    });

    const expiresAt = new Date(
      Date.now() + (this.configService.get<number>('JWT_EXPIRES_IN') || 3600) * 1000,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async logout(dto: LogoutDto, userId: string, ipAddress: string, userAgent: string) {
    const { refreshToken } = dto;

    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Revoke the token
    await this.refreshTokenModel.updateOne(
      { tokenHash, userId },
      { $set: { isRevoked: true } },
    );

    // Log logout
    await this.loginLogModel.create({
      userId,
      eventType: 'logout',
      ipAddress,
      userAgent,
    });

    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    return {
      userId: user._id.toString(),
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      status: user.status,
      isActive: user.isActive,
      isLocked: user.isLocked,
    };
  }

  private generateAccessToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      expiresIn: parseInt(this.configService.get<string>('JWT_EXPIRES_IN') || '3600', 10),
    });
  }

  private async generateRefreshToken(
    user: UserDocument,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      type: 'refresh',
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret-key',
      expiresIn: this.configService.get<number>('JWT_REFRESH_EXPIRES_IN') || 7 * 24 * 60 * 60,
    });
    // Hash token before storing
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Store refresh token
    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }

}
