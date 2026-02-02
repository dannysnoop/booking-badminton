import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OtpService } from '../services/otp.service';
import { VerificationCode } from '../schemas/verification-code.schema';

describe('OtpService', () => {
  let service: OtpService;
  let mockCodeModel: any;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockCodeModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getModelToken(VerificationCode.name),
          useValue: mockCodeModel,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP and cache it', async () => {
      mockCodeModel.create.mockResolvedValue({
        userId: 'user123',
        code: '123456',
        type: 'email',
      });

      const result = await service.generateOtp('user123', 'email');

      expect(result.code).toMatch(/^\d{6}$/);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(mockCodeModel.create).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
    });
  });

  describe('validateOtp', () => {
    it('should return valid:true for correct OTP from cache', async () => {
      const cachedOtp = {
        code: '123456',
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };

      mockCacheManager.get.mockResolvedValue(cachedOtp);

      const result = await service.validateOtp('user123', '123456');

      expect(result.valid).toBe(true);
      expect(mockCodeModel.updateOne).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should return valid:false for wrong OTP', async () => {
      const cachedOtp = {
        code: '123456',
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };

      mockCacheManager.get.mockResolvedValue(cachedOtp);

      const result = await service.validateOtp('user123', '654321');

      expect(result.valid).toBe(false);
      expect(result.attemptsLeft).toBe(4);
    });

    it('should return valid:false for expired OTP', async () => {
      const cachedOtp = {
        code: '123456',
        attempts: 0,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      };

      mockCacheManager.get.mockResolvedValue(cachedOtp);

      const result = await service.validateOtp('user123', '123456');

      expect(result.valid).toBe(false);
      expect(mockCacheManager.del).toHaveBeenCalled();
    });

    it('should return valid:false when max attempts reached', async () => {
      const cachedOtp = {
        code: '123456',
        attempts: 5,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };

      mockCacheManager.get.mockResolvedValue(cachedOtp);

      const result = await service.validateOtp('user123', '654321');

      expect(result.valid).toBe(false);
      expect(result.attemptsLeft).toBe(0);
    });

    it('should fallback to MongoDB when cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const dbCode = {
        code: '123456',
        attempts: 0,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      mockCodeModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(dbCode),
      });

      const result = await service.validateOtp('user123', '123456');

      expect(result.valid).toBe(true);
      expect(mockCodeModel.findOne).toHaveBeenCalled();
    });
  });

  describe('invalidateOldCodes', () => {
    it('should invalidate old OTPs in MongoDB and Redis', async () => {
      await service.invalidateOldCodes('user123');

      expect(mockCodeModel.updateMany).toHaveBeenCalled();
      expect(mockCacheManager.del).toHaveBeenCalledTimes(2);
    });
  });
});
