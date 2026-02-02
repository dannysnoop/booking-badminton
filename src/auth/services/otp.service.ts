import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  VerificationCode,
  VerificationCodeDocument,
} from '../schemas/verification-code.schema';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(VerificationCode.name)
    private codeModel: Model<VerificationCodeDocument>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async generateOtp(userId: string, type: 'email' | 'sms') {
    const code = this.generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save to MongoDB
    await this.codeModel.create({
      userId,
      code,
      type,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
    });

    // Cache to Redis
    const cacheKey = `otp:${userId}:${type}`;
    await this.cacheManager.set(
      cacheKey,
      { code, attempts: 0, expiresAt: expiresAt.toISOString() },
      600000, // 10 minutes in ms
    );

    return { code, expiresAt };
  }

  async validateOtp(
    userId: string,
    code: string,
  ): Promise<{ valid: boolean; attemptsLeft?: number }> {
    // Check Redis cache first
    const cacheKey = `otp:${userId}:email`; // Assume email for now
    let cached = await this.cacheManager.get<any>(cacheKey);

    // If not in cache, check MongoDB
    if (!cached) {
      const dbCode = await this.codeModel
        .findOne({
          userId,
          usedAt: null,
          expiresAt: { $gt: new Date() },
        })
        .sort({ createdAt: -1 });

      if (!dbCode) {
        return { valid: false };
      }

      cached = {
        code: dbCode.code,
        attempts: dbCode.attempts,
        expiresAt: dbCode.expiresAt.toISOString(),
      };
    }

    // Check expiry
    if (new Date(cached.expiresAt) < new Date()) {
      await this.cacheManager.del(cacheKey);
      return { valid: false };
    }

    // Check attempts
    if (cached.attempts >= 5) {
      return { valid: false, attemptsLeft: 0 };
    }

    // Validate code
    if (cached.code !== code) {
      // Increment attempts
      cached.attempts += 1;
      await this.cacheManager.set(cacheKey, cached, 600000);

      // Also update MongoDB
      await this.codeModel.updateOne(
        { userId, usedAt: null },
        { $inc: { attempts: 1 } },
      );

      return { valid: false, attemptsLeft: 5 - cached.attempts };
    }

    // Valid OTP - mark as used
    await this.codeModel.updateOne(
      { userId, code, usedAt: null },
      { $set: { usedAt: new Date() } },
    );

    // Remove from cache
    await this.cacheManager.del(cacheKey);

    return { valid: true };
  }

  async invalidateOldCodes(userId: string) {
    // Mark as expired in MongoDB
    await this.codeModel.updateMany(
      { userId, usedAt: null },
      { $set: { expiresAt: new Date() } },
    );

    // Delete from Redis
    const keys = [`otp:${userId}:email`, `otp:${userId}:sms`];
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }

  private generateRandomCode(length: number): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }
}
