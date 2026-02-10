import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, index: true })
  type: string; // BOOKING, PAYMENT, GROUP_INVITE, SYSTEM, etc.

  @Prop({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING, index: true })
  status: NotificationStatus;

  @Prop({ type: String, enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'] })
  channel: string;

  @Prop({ type: Object })
  data: Record<string, any>; // Additional data for notification

  @Prop()
  readAt: Date;

  @Prop()
  sentAt: Date;

  @Prop()
  errorMessage: string;

  @Prop()
  externalId: string; // For tracking email/SMS delivery
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ status: 1, createdAt: 1 });

