import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupBookingDocument = GroupBooking & Document;

export enum SplitMethod {
  EQUAL = 'EQUAL',
  CUSTOM = 'CUSTOM',
  HOST_PAY_FIRST = 'HOST_PAY_FIRST',
}

export enum GroupBookingStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class GroupBooking {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, unique: true, index: true })
  bookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  hostId: Types.ObjectId;

  @Prop({ required: true, min: 2, max: 20 })
  maxMembers: number;

  @Prop({ required: true, enum: SplitMethod, default: SplitMethod.EQUAL })
  splitMethod: SplitMethod;

  @Prop({ required: true, unique: true })
  inviteCode: string; // e.g., "ABC123"

  @Prop({ required: true })
  inviteLink: string; // Full URL with invite code

  @Prop({ required: true, enum: GroupBookingStatus, default: GroupBookingStatus.OPEN, index: true })
  status: GroupBookingStatus;

  @Prop()
  qrCodeUrl: string; // URL to QR code image
}

export const GroupBookingSchema = SchemaFactory.createForClass(GroupBooking);

// Indexes
GroupBookingSchema.index({ inviteCode: 1 });
GroupBookingSchema.index({ hostId: 1, status: 1 });

