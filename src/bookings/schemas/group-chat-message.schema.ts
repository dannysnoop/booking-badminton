import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupChatMessageDocument = GroupChatMessage & Document;

@Schema({ timestamps: true })
export class GroupChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'GroupBooking', required: true, index: true })
  groupBookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: ['TEXT', 'IMAGE', 'SYSTEM'], default: 'TEXT' })
  messageType: string;

  @Prop({ type: [String] })
  attachments: string[]; // URLs to images or files

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt: Date;
}

export const GroupChatMessageSchema = SchemaFactory.createForClass(GroupChatMessage);

// Indexes
GroupChatMessageSchema.index({ groupBookingId: 1, createdAt: -1 });
GroupChatMessageSchema.index({ senderId: 1 });

