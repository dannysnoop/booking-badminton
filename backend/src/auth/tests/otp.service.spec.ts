import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { OtpService } from '../services/otp.service';
import { VerificationCode } from '../entities/verification-code.entity';

describe('OtpService', () => {
  let service: OtpService;
  let repository: Repository<VerificationCode>;

  const mockRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(VerificationCode),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    repository = module.get<Repository<VerificationCode>>(
      getRepositoryToken(VerificationCode),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOtp', () => {
    it('should generate a 6-digit OTP code', async () => {
      const userId = 'test-user-id';
      const type = 'email';

      mockRepository.save.mockResolvedValue({
        id: 'code-id',
        userId,
        code: '123456',
        type,
        attempts: 0,
        maxAttempts: 5,
      });

      const code = await service.generateOtp(userId, type);

      expect(code).toMatch(/^\d{6}$/);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type,
          code: expect.stringMatching(/^\d{6}$/),
          attempts: 0,
          maxAttempts: 5,
          expiresAt: expect.any(Date),
        }),
      );
    });

    it('should set expiry time to 10 minutes', async () => {
      const userId = 'test-user-id';
      const type = 'email';
      const beforeTime = Date.now() + 10 * 60 * 1000 - 1000;

      mockRepository.save.mockImplementation((data) => {
        return Promise.resolve({ ...data, id: 'code-id' });
      });

      await service.generateOtp(userId, type);

      const savedData = mockRepository.save.mock.calls[0][0];
      const expiresAt = savedData.expiresAt.getTime();
      const afterTime = Date.now() + 10 * 60 * 1000 + 1000;

      expect(expiresAt).toBeGreaterThan(beforeTime);
      expect(expiresAt).toBeLessThan(afterTime);
    });
  });

  describe('validateOtp', () => {
    it('should return valid:true for correct OTP', async () => {
      const userId = 'test-user-id';
      const code = '123456';
      const verificationCode = {
        id: 'code-id',
        userId,
        code,
        type: 'email',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(verificationCode);
      mockRepository.save.mockResolvedValue({
        ...verificationCode,
        usedAt: new Date(),
      });

      const result = await service.validateOtp(userId, code);

      expect(result.valid).toBe(true);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          usedAt: expect.any(Date),
        }),
      );
    });

    it('should return valid:false for incorrect OTP', async () => {
      const userId = 'test-user-id';
      const code = '123456';
      const wrongCode = '654321';
      const verificationCode = {
        id: 'code-id',
        userId,
        code,
        type: 'email',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(verificationCode);
      mockRepository.save.mockResolvedValue({
        ...verificationCode,
        attempts: 1,
      });

      const result = await service.validateOtp(userId, wrongCode);

      expect(result.valid).toBe(false);
      expect(result.attemptsLeft).toBe(4);
      expect(result.error).toBe('INVALID_OTP');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should return error for expired OTP', async () => {
      const userId = 'test-user-id';
      const code = '123456';
      const verificationCode = {
        id: 'code-id',
        userId,
        code,
        type: 'email',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() - 5 * 60 * 1000), // Expired
        usedAt: null,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(verificationCode);

      const result = await service.validateOtp(userId, code);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('OTP_EXPIRED');
    });

    it('should return error when max attempts exceeded', async () => {
      const userId = 'test-user-id';
      const code = '123456';
      const verificationCode = {
        id: 'code-id',
        userId,
        code,
        type: 'email',
        attempts: 5,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(verificationCode);

      const result = await service.validateOtp(userId, code);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('TOO_MANY_ATTEMPTS');
    });

    it('should return error when OTP not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateOtp('test-user-id', '123456');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('INVALID_OTP');
    });
  });

  describe('invalidateOldCodes', () => {
    it('should mark old codes as expired', async () => {
      const userId = 'test-user-id';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.invalidateOldCodes(userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { userId, usedAt: IsNull() },
        { expiresAt: expect.any(Date) },
      );
    });
  });

  describe('getActiveCode', () => {
    it('should return the most recent active code', async () => {
      const userId = 'test-user-id';
      const verificationCode = {
        id: 'code-id',
        userId,
        code: '123456',
        type: 'email',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(verificationCode);

      const result = await service.getActiveCode(userId);

      expect(result).toEqual(verificationCode);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId, usedAt: IsNull() },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return null when no active code exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getActiveCode('test-user-id');

      expect(result).toBeNull();
    });
  });
});
