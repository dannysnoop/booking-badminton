import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {CourtService} from "./services/court.service";
import {ReviewService} from "./services/review.service";
import {CreateCourtDto, SearchCourtDto, UpdateCourtDto} from "./dto/court.dto";
import {CreateReviewDto, UpdateReviewDto, OwnerReplyDto} from "./dto/review.dto";
import {CurrentUser} from "../common/decorators/current-user.decorator";

@ApiTags('courts')
@Controller('api/courts')
export class CourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly reviewService: ReviewService,
  ) {}

  // ==================== Court Management ====================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo sân mới (Owner)' })
  @ApiResponse({ status: 201, description: 'Sân đã được tạo' })
  async createCourt(
    @Body() createCourtDto: CreateCourtDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.courtService.create(createCourtDto, userId);

    return {
      success: true,
      data: result,
      message: 'Sân đã được tạo thành công',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm sân' })
  @ApiResponse({ status: 200, description: 'Danh sách sân' })
  async searchCourts(@Query() searchDto: SearchCourtDto) {
    const result = await this.courtService.findAll(searchDto);

    return {
      success: true,
      data: result.courts,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết sân' })
  @ApiResponse({ status: 200, description: 'Chi tiết sân' })
  async getCourtDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId?: string,
  ) {
    const result = await this.courtService.findOne(id, userId);

    return {
      success: true,
      data: result,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin sân (Owner)' })
  @ApiResponse({ status: 200, description: 'Sân đã được cập nhật' })
  async updateCourt(
    @Param('id') id: string,
    @Body() updateCourtDto: UpdateCourtDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.courtService.update(id, updateCourtDto, userId);

    return {
      success: true,
      data: result,
      message: 'Sân đã được cập nhật',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sân (Owner)' })
  @ApiResponse({ status: 200, description: 'Sân đã được xóa' })
  async deleteCourt(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.courtService.delete(id, userId);

    return {
      success: true,
      message: result.message,
    };
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload ảnh sân (Owner)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Ảnh đã được upload' })
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadCourtImages(
    @Param('id') courtId: string,
    @UploadedFiles() files: any[],
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.courtService.uploadImages(courtId, files, userId);

    return {
      success: true,
      data: result,
      message: 'Ảnh đã được upload',
    };
  }

  // ==================== Reviews ====================

  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đánh giá sân' })
  @ApiResponse({ status: 201, description: 'Đánh giá đã được tạo' })
  async createReview(
    @Param('id') courtId: string,
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.reviewService.create(courtId, userId, createReviewDto);

    return {
      success: true,
      data: result,
      message: 'Đánh giá đã được tạo',
    };
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Lấy danh sách đánh giá' })
  @ApiResponse({ status: 200, description: 'Danh sách đánh giá' })
  async getCourtReviews(
    @Param('id') courtId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const result = await this.reviewService.findByCourtId(courtId, +page, +limit);

    return {
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    };
  }

  @Put('reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đánh giá' })
  @ApiResponse({ status: 200, description: 'Đánh giá đã được cập nhật' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.reviewService.update(reviewId, userId, updateReviewDto);

    return {
      success: true,
      data: result,
      message: 'Đánh giá đã được cập nhật',
    };
  }

  @Delete('reviews/:reviewId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa đánh giá' })
  @ApiResponse({ status: 200, description: 'Đánh giá đã được xóa' })
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.reviewService.delete(reviewId, userId);

    return {
      success: true,
      message: result.message,
    };
  }

  @Post('reviews/:reviewId/reply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chủ sân trả lời đánh giá' })
  @ApiResponse({ status: 200, description: 'Đã trả lời đánh giá' })
  async replyToReview(
    @Param('reviewId') reviewId: string,
    @Body() replyDto: OwnerReplyDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.reviewService.addOwnerReply(reviewId, userId, replyDto);

    return {
      success: true,
      data: result,
      message: 'Đã trả lời đánh giá',
    };
  }
}

