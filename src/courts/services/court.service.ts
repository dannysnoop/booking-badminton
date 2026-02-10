import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Court, CourtDocument } from '../schemas/court.schema';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { CreateCourtDto, UpdateCourtDto, SearchCourtDto } from '../dto/court.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CourtService {
  constructor(
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    private configService: ConfigService,
  ) {}

  async create(createCourtDto: CreateCourtDto, ownerId: string) {
    const court = await this.courtModel.create({
      ...createCourtDto,
      location: {
        type: 'Point',
        coordinates: [createCourtDto.longitude, createCourtDto.latitude],
      },
      ownerId,
      pricing: {
        weekdayPrice: createCourtDto.weekdayPrice,
        weekendPrice: createCourtDto.weekendPrice,
        peakHourPrice: createCourtDto.peakHourPrice,
        currency: 'VND',
      },
      operatingHours: {
        open: createCourtDto.openTime || '06:00',
        close: createCourtDto.closeTime || '22:00',
      },
      phoneNumber: createCourtDto.phoneNumber,
      email: createCourtDto.email,
    });

    return this.formatCourtResponse(court);
  }

  async findAll(searchDto: SearchCourtDto) {
    const {
      keyword,
      courtType,
      longitude,
      latitude,
      radius = 10, // default 10km
      minPrice,
      maxPrice,
      amenities,
      minRating,
      page = 1,
      limit = 20,
      sortBy = 'distance',
      sortOrder = 'asc',
    } = searchDto;

    const query: any = { isActive: true };

    // Text search
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Court type filter
    if (courtType) {
      query.courtType = courtType;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.$or = [];
      if (minPrice) {
        query.$or.push({ 'pricing.weekdayPrice': { $gte: minPrice } });
        query.$or.push({ 'pricing.weekendPrice': { $gte: minPrice } });
      }
      if (maxPrice) {
        query.$or.push({ 'pricing.weekdayPrice': { $lte: maxPrice } });
        query.$or.push({ 'pricing.weekendPrice': { $lte: maxPrice } });
      }
    }

    // Amenities filter
    if (amenities && amenities.length > 0) {
      query.amenities = { $all: amenities };
    }

    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: minRating };
    }

    // Location-based search
    if (longitude !== undefined && latitude !== undefined) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000, // convert km to meters
        },
      };
    }

    // Sorting
    let sort: any = {};
    if (sortBy === 'distance' && longitude !== undefined && latitude !== undefined) {
      // Distance sorting is handled by $near
    } else if (sortBy === 'rating') {
      sort.averageRating = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'price') {
      sort['pricing.weekdayPrice'] = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'desc' ? -1 : 1;
    }

    const skip = (page - 1) * limit;

    const [courts, total] = await Promise.all([
      this.courtModel
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.courtModel.countDocuments(query),
    ]);

    // Calculate distance for each court if location provided
    const courtsWithDistance = courts.map((court) => {
      const result: any = this.formatCourtResponse(court);

      if (longitude !== undefined && latitude !== undefined && court.location) {
        result.distance = this.calculateDistance(
          latitude,
          longitude,
          court.location.coordinates[1],
          court.location.coordinates[0],
        );
      }

      return result;
    });

    return {
      courts: courtsWithDistance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string) {
    const court = await this.courtModel.findById(id).lean().exec();

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    // Increment view count
    await this.courtModel.updateOne({ _id: id }, { $inc: { viewCount: 1 } });

    // Get reviews
    const reviews = await this.reviewModel
      .find({ courtId: id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'fullName avatarUrl')
      .lean()
      .exec();

    const result: any = this.formatCourtResponse(court);
    result.reviews = reviews;

    // Include owner info if user is owner or admin
    if (userId && (court.ownerId.toString() === userId || this.isAdmin(userId))) {
      result.ownerInfo = {
        phoneNumber: court.phoneNumber,
        email: court.email,
        viewCount: court.viewCount,
      };
    }

    return result;
  }

  async update(id: string, updateCourtDto: UpdateCourtDto, userId: string) {
    const court = await this.courtModel.findById(id);

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    // Check ownership
    if (court.ownerId.toString() !== userId && !this.isAdmin(userId)) {
      throw new ForbiddenException('Bạn không có quyền cập nhật sân này');
    }

    // Update location if provided
    if (updateCourtDto.longitude !== undefined && updateCourtDto.latitude !== undefined) {
      court.location = {
        type: 'Point',
        coordinates: [updateCourtDto.longitude, updateCourtDto.latitude],
      };
    }

    // Update pricing
    if (updateCourtDto.weekdayPrice !== undefined) {
      court.pricing = court.pricing || { weekdayPrice: 0, weekendPrice: 0, peakHourPrice: 0, currency: 'VND' };
      court.pricing.weekdayPrice = updateCourtDto.weekdayPrice;
    }
    if (updateCourtDto.weekendPrice !== undefined) {
      court.pricing = court.pricing || { weekdayPrice: 0, weekendPrice: 0, peakHourPrice: 0, currency: 'VND' };
      court.pricing.weekendPrice = updateCourtDto.weekendPrice;
    }
    if (updateCourtDto.peakHourPrice !== undefined) {
      court.pricing = court.pricing || { weekdayPrice: 0, weekendPrice: 0, peakHourPrice: 0, currency: 'VND' };
      court.pricing.peakHourPrice = updateCourtDto.peakHourPrice;
    }

    // Update operating hours
    if (updateCourtDto.openTime) {
      court.operatingHours = court.operatingHours || { open: '06:00', close: '22:00' };
      court.operatingHours.open = updateCourtDto.openTime;
    }
    if (updateCourtDto.closeTime) {
      court.operatingHours = court.operatingHours || { open: '06:00', close: '22:00' };
      court.operatingHours.close = updateCourtDto.closeTime;
    }

    // Update other fields
    Object.assign(court, {
      name: updateCourtDto.name ?? court.name,
      description: updateCourtDto.description ?? court.description,
      address: updateCourtDto.address ?? court.address,
      amenities: updateCourtDto.amenities ?? court.amenities,
      phoneNumber: updateCourtDto.phoneNumber ?? court.phoneNumber,
      email: updateCourtDto.email ?? court.email,
      isActive: updateCourtDto.isActive ?? court.isActive,
    });

    await court.save();

    return this.formatCourtResponse(court);
  }

  async delete(id: string, userId: string) {
    const court = await this.courtModel.findById(id);

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId.toString() !== userId && !this.isAdmin(userId)) {
      throw new ForbiddenException('Bạn không có quyền xóa sân này');
    }

    // Soft delete
    court.isActive = false;
    await court.save();

    return { message: 'Sân đã được xóa' };
  }

  async uploadImages(courtId: string, files: any[], userId: string) {
    const court = await this.courtModel.findById(courtId);

    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    if (court.ownerId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền upload ảnh cho sân này');
    }

    const imageUrls = files.map((file) => `/uploads/courts/${file.filename}`);
    court.images = [...court.images, ...imageUrls];
    await court.save();

    return { images: court.images };
  }

  private formatCourtResponse(court: any) {
    return {
      id: court._id || court.id,
      name: court.name,
      description: court.description,
      address: court.address,
      location: {
        latitude: court.location?.coordinates[1],
        longitude: court.location?.coordinates[0],
      },
      courtType: court.courtType,
      images: court.images,
      amenities: court.amenities,
      pricing: court.pricing,
      operatingHours: court.operatingHours,
      averageRating: court.averageRating,
      totalReviews: court.totalReviews,
      isActive: court.isActive,
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Distance in km, rounded to 2 decimals
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private isAdmin(userId: string): boolean {
    // TODO: Implement admin check
    return false;
  }
}

