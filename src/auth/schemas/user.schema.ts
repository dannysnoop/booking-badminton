import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, unique: true, trim: true, index: true })
  phone: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'locked'],
    default: 'pending',
    index: true,
  })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

