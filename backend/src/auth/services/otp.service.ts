import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCode } from '../entities/verification-code.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(VerificationCode)
    private codeRepo: Repository<VerificationCode>,
  ) {}

  async generateOtp(userId: string, type: 'email' | 'sms'): Promise<string> {
    const code = this.generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.codeRepo.save({
      userId,
      code,
      type,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
    });

    return code;
  }

  async validateOtp(
    userId: string,
    code: string,
  ): Promise<{ valid: boolean; attemptsLeft?: number; error?: string }> {
    // Find active code (not used, not expired)
    const verificationCode = await this.codeRepo.findOne({
      where: {
        userId,
        code,
        usedAt: null as any,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!verificationCode) {
      return { valid: false, error: 'INVALID_OTP' };
    }

    // Check if expired
    if (new Date() > verificationCode.expiresAt) {
      return { valid: false, error: 'OTP_EXPIRED' };
    }

    // Check if too many attempts
    if (verificationCode.attempts >= verificationCode.maxAttempts) {
      return { valid: false, error: 'TOO_MANY_ATTEMPTS' };
    }

    // Increment attempts if code doesn't match
    if (verificationCode.code !== code) {
      verificationCode.attempts += 1;
      await this.codeRepo.save(verificationCode);
      
      const attemptsLeft = verificationCode.maxAttempts - verificationCode.attempts;
      return { valid: false, attemptsLeft, error: 'INVALID_OTP' };
    }

    // Mark as used
    verificationCode.usedAt = new Date();
    await this.codeRepo.save(verificationCode);

    return { valid: true };
  }

  async invalidateOldCodes(userId: string): Promise<void> {
    await this.codeRepo.update(
      { userId, usedAt: null as any },
      { expiresAt: new Date() }, // Set to current time to expire immediately
    );
  }

  async getActiveCode(userId: string): Promise<VerificationCode | null> {
    return this.codeRepo.findOne({
      where: {
        userId,
        usedAt: null as any,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  private generateRandomCode(length: number): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }
}
