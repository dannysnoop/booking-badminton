import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketMessageDocument = TicketMessage & Document;

@Schema({ timestamps: true })
export class TicketMessage {
  @Prop({ type: Types.ObjectId, ref: 'SupportTicket', required: true, index: true })
  ticketId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  isStaffReply: boolean; // true if from support staff

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ default: false })
  isInternal: boolean; // Internal notes not visible to customer
}

export const TicketMessageSchema = SchemaFactory.createForClass(TicketMessage);

// Indexes
TicketMessageSchema.index({ ticketId: 1, createdAt: 1 });

