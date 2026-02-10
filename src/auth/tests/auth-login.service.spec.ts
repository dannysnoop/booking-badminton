import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { RateLimitService } from '../services/rate-limit.service';
import { NotificationService } from '../services/notification.service';
import { User } from '../schemas/user.schema';
import { RegistrationLog } from '../schemas/registration-log.schema';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { LoginLog } from '../schemas/login-log.schema';
import * as bcrypt from 'bcrypt';

describe('AuthService - Login & Token Management', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockRefreshTokenModel: any;
  let mockLoginLogModel: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    mockRefreshTokenModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    };

    mockLoginLogModel = {
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: any = {
          JWT_SECRET: 'test-secret',
          JWT_EXPIRES_IN: '1h',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return config[key];
      }),
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
          useValue: { create: jest.fn() },
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenModel,
        },
        {
          provide: getModelToken(LoginLog.name),
          useValue: mockLoginLogModel,
        },
        {
          provide: OtpService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: RateLimitService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    const loginDto = {
      username: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        phone: '0912345678',
        passwordHash: await bcrypt.hash('SecurePass123!', 10),
        fullName: 'Test User',
        status: 'verified',
        isActive: true,
        isLocked: false,
        failedLoginCount: 0,
        save: jest.fn(),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockRefreshTokenModel.create.mockResolvedValue({});
      mockLoginLogModel.create.mockResolvedValue({});

      const result = await service.login(loginDto, '127.0.0.1', 'test-agent');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId');
      expect(result.email).toBe(mockUser.email);
      expect(mockUser.failedLoginCount).toBe(0);
      expect(mockLoginLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser._id,
          eventType: 'login_success',
        }),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login(loginDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const mockUser = {
        email: 'test@example.com',
        isActive: false,
        isLocked: false,
        status: 'verified',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login(loginDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked user', async () => {
      const mockUser = {
        email: 'test@example.com',
        isActive: true,
        isLocked: true,
        status: 'verified',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login(loginDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should increment failedLoginCount on wrong password', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('DifferentPassword', 10),
        status: 'verified',
        isActive: true,
        isLocked: false,
        failedLoginCount: 0,
        save: jest.fn(),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockLoginLogModel.create.mockResolvedValue({});

      await expect(
        service.login(loginDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUser.failedLoginCount).toBe(1);
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockLoginLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'login_failed',
        }),
      );
    });

    it('should lock account after max failed attempts', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('DifferentPassword', 10),
        status: 'verified',
        isActive: true,
        isLocked: false,
        failedLoginCount: 4,
        lockedAt: null,
        save: jest.fn(),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockLoginLogModel.create.mockResolvedValue({});

      await expect(
        service.login(loginDto, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockUser.failedLoginCount).toBe(5);
      expect(mockUser.isLocked).toBe(true);
      expect(mockUser.lockedAt).toBeDefined();
      expect(mockLoginLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'login_failed',
          metadata: expect.objectContaining({
            reason: 'account_locked',
          }),
        }),
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        phone: '0912345678',
        fullName: 'Test User',
        status: 'verified',
        isActive: true,
        isLocked: false,
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile('user123');

      expect(result.userId).toBe('user123');
      expect(result.email).toBe(mockUser.email);
      expect(result.fullName).toBe(mockUser.fullName);
    });

    it('should throw BadRequestException for non-existent user', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(service.getProfile('user123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('logout', () => {
    it('should revoke refresh token and log logout event', async () => {
      mockRefreshTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });
      mockLoginLogModel.create.mockResolvedValue({});

      const result = await service.logout(
        { refreshToken: 'test-token' },
        'user123',
        '127.0.0.1',
        'test-agent',
      );

      expect(result.success).toBe(true);
      expect(mockRefreshTokenModel.updateOne).toHaveBeenCalled();
      expect(mockLoginLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          eventType: 'logout',
        }),
      );
    });
  });
});

