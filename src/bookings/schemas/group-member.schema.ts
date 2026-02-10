import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupMemberDocument = GroupMember & Document;

export enum MemberStatus {
  INVITED = 'INVITED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  REMOVED = 'REMOVED',
}

export enum MemberPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class GroupMember {
  @Prop({ type: Types.ObjectId, ref: 'GroupBooking', required: true, index: true })
  groupBookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: MemberStatus, default: MemberStatus.INVITED })
  status: MemberStatus;

  @Prop({ required: true })
  amountToPay: number;

  @Prop({ required: true, enum: MemberPaymentStatus, default: MemberPaymentStatus.PENDING })
  paymentStatus: MemberPaymentStatus;

  @Prop()
  paidAt: Date;

  @Prop()
  invitedAt: Date;

  @Prop()
  respondedAt: Date;

  @Prop()
  invitedBy: Types.ObjectId; // User who sent the invite (usually host)
}

export const GroupMemberSchema = SchemaFactory.createForClass(GroupMember);

// Indexes
GroupMemberSchema.index({ groupBookingId: 1, userId: 1 }, { unique: true });
GroupMemberSchema.index({ userId: 1, status: 1 });
GroupMemberSchema.index({ groupBookingId: 1, status: 1 });

