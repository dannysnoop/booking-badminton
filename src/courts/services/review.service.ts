import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { Court, CourtDocument } from '../schemas/court.schema';
import { CreateReviewDto, UpdateReviewDto, OwnerReplyDto } from '../dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Court.name) private courtModel: Model<CourtDocument>,
  ) {}

  async create(courtId: string, userId: string, createReviewDto: CreateReviewDto) {
    // Check if court exists
    const court = await this.courtModel.findById(courtId);
    if (!court) {
      throw new NotFoundException('Sân không tồn tại');
    }

    // Check if user already reviewed this court
    const existingReview = await this.reviewModel.findOne({ courtId, userId });
    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sân này rồi');
    }

    // Create review
    const review = await this.reviewModel.create({
      courtId,
      userId,
      ...createReviewDto,
    });

    // Update court rating statistics
    await this.updateCourtRating(courtId);

    return review;
  }

  async findByCourtId(courtId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ courtId, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'fullName avatarUrl')
        .lean()
        .exec(),
      this.reviewModel.countDocuments({ courtId, isActive: true }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(reviewId: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa đánh giá này');
    }

    Object.assign(review, updateReviewDto);
    await review.save();

    // Update court rating if rating changed
    if (updateReviewDto.rating) {
      await this.updateCourtRating(review.courtId.toString());
    }

    return review;
  }

  async delete(reviewId: string, userId: string) {
    const review = await this.reviewModel.findById(reviewId);

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    // Soft delete
    review.isActive = false;
    await review.save();

    // Update court rating
    await this.updateCourtRating(review.courtId.toString());

    return { message: 'Đánh giá đã được xóa' };
  }

  async addOwnerReply(reviewId: string, ownerId: string, replyDto: OwnerReplyDto) {
    const review = await this.reviewModel.findById(reviewId).populate('courtId');

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    const court = review.courtId as any;
    if (court.ownerId.toString() !== ownerId) {
      throw new ForbiddenException('Bạn không phải chủ sân');
    }

    review.ownerReply = replyDto.reply;
    review.ownerRepliedAt = new Date();
    await review.save();

    return review;
  }

  private async updateCourtRating(courtId: string) {
    const stats = await this.reviewModel.aggregate([
      { $match: { courtId: courtId, isActive: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await this.courtModel.updateOne(
        { _id: courtId },
        {
          averageRating: Math.round(stats[0].averageRating * 10) / 10,
          totalReviews: stats[0].totalReviews,
        },
      );
    } else {
      await this.courtModel.updateOne(
        { _id: courtId },
        {
          averageRating: 0,
          totalReviews: 0,
        },
      );
    }
  }
}

