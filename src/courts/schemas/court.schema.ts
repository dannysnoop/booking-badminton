import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourtDocument = Court & Document;

export class GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

@Schema({ timestamps: true })
export class Court {
  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  })
  location: GeoPoint;

  @Prop({ required: true, index: true })
  courtType: string; // badminton, football, tennis, basketball, etc.

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  amenities: string[]; // parking, shower, wifi, locker, etc.

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  // Pricing information (optional - can be separate schema)
  @Prop({
    type: {
      weekdayPrice: Number,
      weekendPrice: Number,
      peakHourPrice: Number,
      currency: { type: String, default: 'VND' },
    },
  })
  pricing: {
    weekdayPrice: number;
    weekendPrice: number;
    peakHourPrice: number;
    currency: string;
  };

  // Operating hours
  @Prop({
    type: {
      open: String, // "06:00"
      close: String, // "22:00"
    },
  })
  operatingHours: {
    open: string;
    close: string;
  };

  // Contact info
  @Prop()
  phoneNumber: string;

  @Prop()
  email: string;

  // Rating statistics (denormalized for performance)
  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  // View count
  @Prop({ default: 0 })
  viewCount: number;
}

export const CourtSchema = SchemaFactory.createForClass(Court);

// Geospatial index for location-based queries
CourtSchema.index({ location: '2dsphere' });

// Text index for search
CourtSchema.index({ name: 'text', description: 'text', address: 'text' });

// Compound indexes for common queries
CourtSchema.index({ courtType: 1, isActive: 1 });
CourtSchema.index({ ownerId: 1, isActive: 1 });
CourtSchema.index({ averageRating: -1 });

