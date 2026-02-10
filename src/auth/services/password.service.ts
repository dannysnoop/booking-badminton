import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';
import { PasswordReset, PasswordResetDocument } from '../schemas/password-reset.schema';
import { NotificationService } from './notification.service';

@Injectable()
export class PasswordService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
    private notificationService: NotificationService,
  ) {}

  async forgotPassword(email: string, ipAddress: string, userAgent: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return {
        message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.passwordResetModel.create({
      userId: user._id,
      token: tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await this.notificationService.sendPasswordResetEmail(user.email, resetLink, user.fullName);

    return {
      message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await this.passwordResetModel.findOne({
      token: tokenHash,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const user = await this.userModel.findById(resetRecord.userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    user.passwordHash = passwordHash;
    user.failedLoginCount = 0;
    user.isLocked = false;
    await user.save();

    resetRecord.isUsed = true;
    await resetRecord.save();

    await this.notificationService.sendPasswordChangedEmail(user.email, user.fullName);

    return {
      message: 'Mật khẩu đã được đặt lại thành công',
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (!user.passwordHash) {
      throw new BadRequestException(
        'Tài khoản này đăng nhập qua mạng xã hội. Vui lòng đặt mật khẩu trước.',
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác');
    }

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    await this.notificationService.sendPasswordChangedEmail(user.email, user.fullName);

    return {
      message: 'Mật khẩu đã được thay đổi thành công',
    };
  }
}

