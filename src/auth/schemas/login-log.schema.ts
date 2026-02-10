import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LoginLogDocument = LoginLog & Document;

@Schema({ timestamps: true })
export class LoginLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  eventType: string; // 'login_success', 'login_failed', 'logout', 'token_refresh'

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const LoginLogSchema = SchemaFactory.createForClass(LoginLog);

// Indexes
LoginLogSchema.index({ userId: 1, createdAt: -1 });
LoginLogSchema.index({ eventType: 1 });

