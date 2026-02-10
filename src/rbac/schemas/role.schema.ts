import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, index: true })
  name: string; // ADMIN, OWNER, STAFF, USER

  @Prop({ required: true })
  displayName: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[]; // Array of permission strings

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSystem: boolean; // System roles cannot be deleted
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes
RoleSchema.index({ name: 1 });
RoleSchema.index({ isActive: 1 });

