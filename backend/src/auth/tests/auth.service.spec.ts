import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { NotificationService } from '../services/notification.service';
import { User } from '../entities/user.entity';
import { RegistrationLog } from '../entities/registration-log.entity';
import { RegisterDto } from '../dto/register.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let logRepository: Repository<RegistrationLog>;
  let otpService: OtpService;
  let notificationService: NotificationService;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockOtpService = {
    generateOtp: jest.fn(),
    validateOtp: jest.fn(),
    invalidateOldCodes: jest.fn(),
  };

  const mockNotificationService = {
    sendOtpEmail: jest.fn(),
    sendOtpSms: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        BCRYPT_SALT_ROUNDS: 10,
        OTP_EXPIRY_MINUTES: 10,
        OTP_RESEND_COOLDOWN_SECONDS: 60,
        OTP_MAX_RESENDS_PER_DAY: 5,
      };
      return config[key] !== undefined ? config[key] : defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RegistrationLog),
          useValue: mockLogRepository,
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    logRepository = module.get<Repository<RegistrationLog>>(
      getRepositoryToken(RegistrationLog),
    );
    otpService = module.get<OtpService>(OtpService);
    notificationService = module.get<NotificationService>(NotificationService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      phone: '0912345678',
      password: 'SecurePass123!',
      fullName: 'Test User',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: 'test-user-id',
        email: registerDto.email,
        phone: registerDto.phone,
        passwordHash: 'hashed-password',
        fullName: registerDto.fullName,
        status: 'pending',
      });
      mockUserRepository.save.mockResolvedValue({
        id: 'test-user-id',
        email: registerDto.email,
        phone: registerDto.phone,
        passwordHash: 'hashed-password',
        fullName: registerDto.fullName,
        status: 'pending',
      });
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});
      mockOtpService.generateOtp.mockResolvedValue('123456');
      mockNotificationService.sendOtpEmail.mockResolvedValue(undefined);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(
        registerDto,
        '127.0.0.1',
        'test-agent',
      );

      expect(result.success).toBe(true);
      expect(result.data.userId).toBe('test-user-id');
      expect(result.data.email).toBe(registerDto.email);
      expect(result.data.status).toBe('pending');
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // Check email and phone
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockOtpService.generateOtp).toHaveBeenCalled();
      expect(mockNotificationService.sendOtpEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(
        service.register(registerDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for duplicate phone', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // No duplicate email
        .mockResolvedValueOnce({
          id: 'existing-user',
          phone: registerDto.phone,
        }); // Duplicate phone

      await expect(
        service.register(registerDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyOtp', () => {
    const verifyDto: VerifyOtpDto = {
      userId: 'test-user-id',
      code: '123456',
    };

    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      phone: '0912345678',
      status: 'pending',
    };

    it('should successfully verify OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        status: 'verified',
      });
      mockOtpService.validateOtp.mockResolvedValue({ valid: true });
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});

      const result = await service.verifyOtp(verifyDto);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('verified');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockOtpService.validateOtp.mockResolvedValue({
        valid: false,
        error: 'INVALID_OTP',
        attemptsLeft: 3,
      });
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for expired OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockOtpService.validateOtp.mockResolvedValue({
        valid: false,
        error: 'OTP_EXPIRED',
      });
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for too many attempts', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockOtpService.validateOtp.mockResolvedValue({
        valid: false,
        error: 'TOO_MANY_ATTEMPTS',
      });
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});

      await expect(service.verifyOtp(verifyDto)).rejects.toThrow();
    });
  });

  describe('resendOtp', () => {
    const resendDto: ResendOtpDto = {
      userId: 'test-user-id',
      type: 'email',
    };

    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      phone: '0912345678',
      status: 'pending',
    };

    it('should successfully resend OTP', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLogRepository.findOne.mockResolvedValue(null); // No recent resend
      mockLogRepository.count.mockResolvedValue(2); // Less than 5 resends today
      mockOtpService.invalidateOldCodes.mockResolvedValue(undefined);
      mockOtpService.generateOtp.mockResolvedValue('654321');
      mockNotificationService.sendOtpEmail.mockResolvedValue(undefined);
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});

      const result = await service.resendOtp(resendDto);

      expect(result.success).toBe(true);
      expect(result.data.expiresAt).toBeDefined();
      expect(result.data.nextResendAt).toBeDefined();
      expect(mockOtpService.invalidateOldCodes).toHaveBeenCalled();
      expect(mockOtpService.generateOtp).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.resendOtp(resendDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for rate limit exceeded', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLogRepository.findOne.mockResolvedValue({
        createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      });

      await expect(service.resendOtp(resendDto)).rejects.toThrow();
    });

    it('should throw error for daily limit exceeded', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLogRepository.findOne.mockResolvedValue(null); // No recent resend
      mockLogRepository.count.mockResolvedValue(5); // Already 5 resends today

      await expect(service.resendOtp(resendDto)).rejects.toThrow();
    });

    it('should send SMS when type is sms', async () => {
      const smsDtoData: ResendOtpDto = { ...resendDto, type: 'sms' };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockLogRepository.findOne.mockResolvedValue(null);
      mockLogRepository.count.mockResolvedValue(2);
      mockOtpService.invalidateOldCodes.mockResolvedValue(undefined);
      mockOtpService.generateOtp.mockResolvedValue('654321');
      mockNotificationService.sendOtpSms.mockResolvedValue(undefined);
      mockLogRepository.create.mockReturnValue({});
      mockLogRepository.save.mockResolvedValue({});

      await service.resendOtp(smsDtoData);

      expect(mockNotificationService.sendOtpSms).toHaveBeenCalled();
      expect(mockNotificationService.sendOtpEmail).not.toHaveBeenCalled();
    });
  });
});
