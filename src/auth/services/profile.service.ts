import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async updateProfile(userId: string, updates: { fullName?: string }) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    if (updates.fullName) {
      user.fullName = updates.fullName;
    }

    await user.save();

    return {
      userId: user._id.toString(),
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  async uploadAvatar(userId: string, file: any) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;

    user.avatarUrl = avatarUrl;
    await user.save();

    return {
      avatarUrl: user.avatarUrl,
    };
  }

  async deleteAvatar(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User không tồn tại');
    }

    user.avatarUrl = null;
    await user.save();

    return {
      message: 'Avatar đã được xóa',
    };
  }
}

