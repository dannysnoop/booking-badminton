import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum ScheduleType {
  IMMEDIATE = 'IMMEDIATE',
  DELAYED = 'DELAYED',
}

@Schema({ timestamps: true })
export class NotificationTemplate {
  @Prop({ required: true, unique: true, index: true })
  code: string; // BOOKING_CONFIRMED, GROUP_INVITE, PAYMENT_SUCCESS, etc.

  @Prop({ required: true, type: [String], enum: NotificationChannel })
  channels: NotificationChannel[];

  @Prop()
  titleTemplate: string;

  @Prop({ required: true })
  contentTemplate: string;

  @Prop({ required: true, enum: ScheduleType, default: ScheduleType.IMMEDIATE })
  scheduleType: ScheduleType;

  @Prop({ default: 0 })
  delaySeconds: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);

// Indexes
NotificationTemplateSchema.index({ code: 1 });
NotificationTemplateSchema.index({ isActive: 1 });

