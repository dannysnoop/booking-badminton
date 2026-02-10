import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, unique: true, sparse: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: false, unique: true, sparse: true, trim: true, index: true })
  phone: string;

  @Prop({ required: false })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: null })
  avatarUrl: string;

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'locked'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isLocked: boolean;

  @Prop({ default: 0 })
  failedLoginCount: number;

  @Prop({ type: Date, default: null })
  lockedAt: Date;

  // OAuth providers
  @Prop({
    type: {
      google: {
        providerId: String,
        email: String,
      },
      facebook: {
        providerId: String,
        email: String,
      },
    },
    default: {},
  })
  authProviders: {
    google?: {
      providerId: string;
      email?: string;
    };
    facebook?: {
      providerId: string;
      email?: string;
    };
  };

  // 2FA
  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop({ default: null })
  twoFactorSecret: string; // Will be encrypted

  @Prop({ default: null })
  twoFactorBackupCodes: string[]; // Hashed backup codes
}

export const UserSchema = SchemaFactory.createForClass(User);

