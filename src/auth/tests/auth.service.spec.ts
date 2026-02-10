import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { RateLimitService } from '../services/rate-limit.service';
import { NotificationService } from '../services/notification.service';
import { User } from '../schemas/user.schema';
import { RegistrationLog } from '../schemas/registration-log.schema';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockLogModel: any;
  let mockOtpService: any;
  let mockNotificationService: any;
  let mockRateLimitService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockLogModel = {
      create: jest.fn(),
    };

    mockOtpService = {
      generateOtp: jest.fn(),
      validateOtp: jest.fn(),
      invalidateOldCodes: jest.fn(),
    };

    mockNotificationService = {
      sendOtpEmail: jest.fn(),
      sendOtpSms: jest.fn(),
      sendOtpDemoCache: jest.fn(),
    };

    mockRateLimitService = {
      checkRegisterLimit: jest.fn(),
      checkVerifyLimit: jest.fn(),
      checkResendLimit: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(RegistrationLog.name),
          useValue: mockLogModel,
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: RateLimitService,
          useValue: mockRateLimitService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      phone: '0912345678',
      password: 'SecurePass123!',
      fullName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      mockRateLimitService.checkRegisterLimit.mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue({
        _id: 'user123',
        id: 'user123',
        email: registerDto.email,
        phone: registerDto.phone,
        fullName: registerDto.fullName,
        status: 'pending',
      });
      mockNotificationService.sendOtpDemoCache.mockResolvedValue(undefined);
      mockLogModel.create.mockResolvedValue({});

      const result = await service.register(registerDto, '192.168.1.1', 'TestAgent');

      expect(result.email).toBe(registerDto.email);
      expect(result.status).toBe('pending');
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockNotificationService.sendOtpDemoCache).toHaveBeenCalled();
      expect(mockLogModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockRateLimitService.checkRegisterLimit.mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue({
        email: registerDto.email,
      });

      await expect(
        service.register(registerDto, '192.168.1.1', 'TestAgent'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate phone', async () => {
      mockRateLimitService.checkRegisterLimit.mockResolvedValue(undefined);
      mockUserModel.findOne.mockResolvedValue({
        phone: registerDto.phone,
      });

      await expect(
        service.register(registerDto, '192.168.1.1', 'TestAgent'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyOtp', () => {
    const verifyDto = {
      userId: 'user123',
      code: '123456',
    };

    it('should verify OTP successfully', async () => {
      mockRateLimitService.checkVerifyLimit.mockResolvedValue(undefined);
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        phone: '0912345678',
        status: 'pending',
        save: jest.fn(),
      };
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockOtpService.validateOtp.mockResolvedValue({ valid: true });
      mockLogModel.create.mockResolvedValue({});

      const result = await service.verifyOtp(verifyDto);

      expect(result.status).toBe('verified');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockLogModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      mockRateLimitService.checkVerifyLimit.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        status: 'pending',
      });
      mockOtpService.validateOtp.mockResolvedValue({
        valid: false,
        attemptsLeft: 3,
      });
      mockLogModel.create.mockResolvedValue({});

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-existent user', async () => {
      mockRateLimitService.checkVerifyLimit.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for already verified user', async () => {
      mockRateLimitService.checkVerifyLimit.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue({
        status: 'verified',
      });

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resendOtp', () => {
    const resendDto = {
      userId: 'user123',
      type: 'email' as 'email' | 'sms',
    };

    it('should resend OTP successfully', async () => {
      mockRateLimitService.checkResendLimit.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue({
        _id: 'user123',
        email: 'test@example.com',
        phone: '0912345678',
        status: 'pending',
      });
      mockOtpService.invalidateOldCodes.mockResolvedValue(undefined);
      mockOtpService.generateOtp.mockResolvedValue({
        code: '654321',
        expiresAt: new Date(),
      });
      mockNotificationService.sendOtpEmail.mockResolvedValue(undefined);
      mockLogModel.create.mockResolvedValue({});

      const result = await service.resendOtp(resendDto);

      expect(result).toHaveProperty('expiresAt');
      expect(result).toHaveProperty('nextResendAt');
      expect(mockOtpService.invalidateOldCodes).toHaveBeenCalled();
      expect(mockOtpService.generateOtp).toHaveBeenCalled();
      expect(mockNotificationService.sendOtpEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-existent user', async () => {
      mockRateLimitService.checkResendLimit.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.resendOtp(resendDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for already verified user', async () => {
      mockRateLimitService.checkResendLimit.mockResolvedValue(undefined);
      mockUserModel.findById.mockResolvedValue({
        status: 'verified',
      });

      await expect(service.resendOtp(resendDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
