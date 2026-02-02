import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RateLimitService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkRegisterLimit(ipAddress: string) {
    const key = `rate_limit:register:${ipAddress}`;
    const count = (await this.cacheManager.get<number>(key)) || 0;

    if (count >= 5) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message:
              'Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau 15 phút.',
            retryAfter: 900,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(key, count + 1, 900000); // 15 minutes
  }

  async checkVerifyLimit(userId: string) {
    const key = `rate_limit:verify:${userId}`;
    const count = (await this.cacheManager.get<number>(key)) || 0;

    if (count >= 10) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message:
              'Bạn đã thử xác thực quá nhiều lần. Vui lòng thử lại sau 5 phút.',
            retryAfter: 300,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(key, count + 1, 300000); // 5 minutes
  }

  async checkResendLimit(userId: string) {
    // Check cooldown (1 per minute)
    const cooldownKey = `rate_limit:resend:${userId}`;
    const lastResend = await this.cacheManager.get<number>(cooldownKey);

    if (lastResend) {
      const secondsLeft = Math.ceil((lastResend - Date.now()) / 1000);
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Vui lòng đợi ${secondsLeft} giây trước khi yêu cầu mã mới`,
            retryAfter: secondsLeft,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check daily limit (5 per day)
    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `resend_count:${userId}:${today}`;
    const dailyCount = (await this.cacheManager.get<number>(dailyKey)) || 0;

    if (dailyCount >= 5) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'DAILY_LIMIT_EXCEEDED',
            message:
              'Bạn đã yêu cầu gửi lại OTP quá nhiều lần trong ngày.',
            resetsAt: new Date(Date.now() + 86400000).toISOString(),
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Set cooldown
    await this.cacheManager.set(cooldownKey, Date.now() + 60000, 60000); // 1 minute

    // Increment daily count
    await this.cacheManager.set(dailyKey, dailyCount + 1, 86400000); // 24 hours
  }
}
