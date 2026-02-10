import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserRoleDocument = UserRole & Document;

@Schema({ timestamps: true })
export class UserRole {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true, index: true })
  roleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId: Types.ObjectId; // For court-specific roles (e.g., OWNER of specific court)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  grantedBy: Types.ObjectId;

  @Prop()
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserRoleSchema = SchemaFactory.createForClass(UserRole);

// Indexes
UserRoleSchema.index({ userId: 1, roleId: 1 });
UserRoleSchema.index({ userId: 1, isActive: 1 });
UserRoleSchema.index({ courtId: 1 });

