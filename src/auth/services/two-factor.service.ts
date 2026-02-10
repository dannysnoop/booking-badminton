import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async generateSecret(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA đã được kích hoạt');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Badminton Booking (${user.email || user.phone})`,
      issuer: 'Badminton Booking',
      length: 32,
    });

    // Save temporary secret (not activated yet)
    user.twoFactorSecret = this.encryptSecret(secret.base32);
    await user.save();

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
    };
  }

  async enable2FA(userId: string, token: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA đã được kích hoạt');
    }

    if (!user.twoFactorSecret) {
      throw new BadRequestException('Chưa tạo secret. Vui lòng gọi /2fa/setup trước');
    }

    // Decrypt and verify token
    const secret = this.decryptSecret(user.twoFactorSecret);
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Mã xác thực không chính xác');
    }

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10)),
    );

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save();

    return {
      enabled: true,
      backupCodes, // Return plain codes only once
    };
  }

  async verify2FA(userId: string, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    const secret = this.decryptSecret(user.twoFactorSecret);
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  async disable2FA(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA chưa được kích hoạt');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    return { disabled: true };
  }

  async verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorBackupCodes?.length) {
      return false;
    }

    // Check if any backup code matches
    for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
      const isMatch = await bcrypt.compare(backupCode, user.twoFactorBackupCodes[i]);
      if (isMatch) {
        // Remove used backup code
        user.twoFactorBackupCodes.splice(i, 1);
        await user.save();
        return true;
      }
    }

    return false;
  }

  async regenerateBackupCodes(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('2FA chưa được kích hoạt');
    }

    const backupCodes = this.generateBackupCodes(10);
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => bcrypt.hash(code, 10)),
    );

    user.twoFactorBackupCodes = hashedBackupCodes;
    await user.save();

    return { backupCodes };
  }

  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(6).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  private encryptSecret(secret: string): string {
    // Simple encryption - in production, use proper encryption library
    const key = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-this';
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptSecret(encrypted: string): string {
    const key = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-this';
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

