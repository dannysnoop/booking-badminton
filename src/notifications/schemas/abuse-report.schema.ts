import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AbuseReportDocument = AbuseReport & Document;

export enum ReportStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

export enum ReportReason {
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  FRAUD = 'FRAUD',
  FAKE_PROFILE = 'FAKE_PROFILE',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true })
export class AbuseReport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  reporterId: Types.ObjectId;

  @Prop({ required: true, index: true })
  resourceType: string; // USER, COURT, REVIEW, BOOKING, etc.

  @Prop({ type: Types.ObjectId, required: true, index: true })
  resourceId: Types.ObjectId;

  @Prop({ required: true, enum: ReportReason })
  reason: ReportReason;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  evidence: string[]; // Screenshots, links, etc.

  @Prop({ required: true, enum: ReportStatus, default: ReportStatus.PENDING, index: true })
  status: ReportStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy: Types.ObjectId;

  @Prop()
  reviewedAt: Date;

  @Prop()
  resolution: string;

  @Prop()
  actionTaken: string; // WARNED, SUSPENDED, BANNED, CONTENT_REMOVED, etc.
}

export const AbuseReportSchema = SchemaFactory.createForClass(AbuseReport);

// Indexes
AbuseReportSchema.index({ reporterId: 1, status: 1 });
AbuseReportSchema.index({ resourceType: 1, resourceId: 1 });
AbuseReportSchema.index({ status: 1, createdAt: -1 });

