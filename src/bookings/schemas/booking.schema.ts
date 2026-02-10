import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingType {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Court', required: true, index: true })
  courtId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId; // Person who created the booking

  @Prop({ required: true, enum: BookingType, default: BookingType.INDIVIDUAL })
  bookingType: BookingType;

  @Prop({ required: true })
  bookingDate: Date;

  @Prop({ required: true })
  startTime: string; // "14:00"

  @Prop({ required: true })
  endTime: string; // "16:00"

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: 'VND' })
  currency: string;

  @Prop({ required: true, enum: BookingStatus, default: BookingStatus.PENDING, index: true })
  status: BookingStatus;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING, index: true })
  paymentStatus: PaymentStatus;

  @Prop()
  notes: string;

  @Prop()
  cancelReason: string;

  @Prop()
  cancelledAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy: Types.ObjectId;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes
BookingSchema.index({ courtId: 1, bookingDate: 1, status: 1 });
BookingSchema.index({ userId: 1, status: 1 });
BookingSchema.index({ bookingDate: 1, startTime: 1 });

