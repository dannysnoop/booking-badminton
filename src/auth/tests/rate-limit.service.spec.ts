import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RateLimitService } from '../services/rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkRegisterLimit', () => {
    it('should allow registration within limit', async () => {
      mockCacheManager.get.mockResolvedValue(3);

      await expect(service.checkRegisterLimit('192.168.1.1')).resolves.not.toThrow();
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should throw error when limit exceeded', async () => {
      mockCacheManager.get.mockResolvedValue(5);

      try {
        await service.checkRegisterLimit('192.168.1.1');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(error.getResponse()).toMatchObject({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
          },
        });
      }
    });

    it('should allow registration when no previous attempts', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      await expect(service.checkRegisterLimit('192.168.1.1')).resolves.not.toThrow();
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'rate_limit:register:192.168.1.1',
        1,
        900000,
      );
    });
  });

  describe('checkVerifyLimit', () => {
    it('should allow verification within limit', async () => {
      mockCacheManager.get.mockResolvedValue(5);

      await expect(service.checkVerifyLimit('user123')).resolves.not.toThrow();
      expect(mockCacheManager.set).toHaveBeenCalled();
    });

    it('should throw error when limit exceeded', async () => {
      mockCacheManager.get.mockResolvedValue(10);

      try {
        await service.checkVerifyLimit('user123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      }
    });
  });

  describe('checkResendLimit', () => {
    it('should throw error when in cooldown period', async () => {
      mockCacheManager.get.mockResolvedValue(Date.now() + 30000);

      try {
        await service.checkResendLimit('user123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(error.getResponse().error.code).toBe('RATE_LIMIT_EXCEEDED');
      }
    });

    it('should throw error when daily limit exceeded', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null); // No cooldown
      mockCacheManager.get.mockResolvedValueOnce(5); // Daily count = 5

      try {
        await service.checkResendLimit('user123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(error.getResponse().error.code).toBe('DAILY_LIMIT_EXCEEDED');
      }
    });

    it('should allow resend within limits', async () => {
      mockCacheManager.get.mockResolvedValueOnce(null); // No cooldown
      mockCacheManager.get.mockResolvedValueOnce(2); // Daily count = 2

      await expect(service.checkResendLimit('user123')).resolves.not.toThrow();
      expect(mockCacheManager.set).toHaveBeenCalledTimes(2);
    });
  });
});
