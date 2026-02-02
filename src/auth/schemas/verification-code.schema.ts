import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationCodeDocument = VerificationCode & Document;

@Schema({ timestamps: true })
export class VerificationCode {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop({ type: String, enum: ['email', 'sms'], required: true })
  type: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 5 })
  maxAttempts: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: null })
  usedAt: Date;
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);

// Indexes
VerificationCodeSchema.index({ userId: 1 });
VerificationCodeSchema.index({ code: 1 });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
