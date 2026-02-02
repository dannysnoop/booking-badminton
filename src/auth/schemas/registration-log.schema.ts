import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegistrationLogDocument = RegistrationLog & Document;

@Schema({ timestamps: true })
export class RegistrationLog {
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  userId: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  eventType: string; // 'register', 'verify_success', 'verify_failed', 'resend_otp'

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const RegistrationLogSchema = SchemaFactory.createForClass(RegistrationLog);

// Indexes
RegistrationLogSchema.index({ userId: 1 });
RegistrationLogSchema.index({ createdAt: -1 });
RegistrationLogSchema.index({ eventType: 1 });
