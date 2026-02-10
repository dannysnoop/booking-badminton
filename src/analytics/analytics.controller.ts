import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsQueryDto } from './dto/analytics.dto';

@ApiTags('analytics')
@Controller('api/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Lấy tổng quan dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard summary' })
  async getDashboard() {
    const result = await this.analyticsService.getDashboardSummary();

    return {
      success: true,
      data: result,
    };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Thống kê doanh thu' })
  @ApiResponse({ status: 200, description: 'Revenue statistics' })
  async getRevenueStats(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const result = await this.analyticsService.getRevenueStats(
      startDate,
      endDate,
      query.courtId,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Thống kê tỉ lệ lấp đầy' })
  @ApiResponse({ status: 200, description: 'Occupancy rate' })
  async getOccupancyRate(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const result = await this.analyticsService.getOccupancyRate(
      startDate,
      endDate,
      query.courtId,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('top-courts')
  @ApiOperation({ summary: 'Top sân có doanh thu cao nhất' })
  @ApiResponse({ status: 200, description: 'Top courts' })
  async getTopCourts(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();
    const limit = query.limit || 10;

    const result = await this.analyticsService.getTopCourts(startDate, endDate, limit);

    return {
      success: true,
      data: result,
    };
  }

  @Get('users')
  @ApiOperation({ summary: 'Thống kê người dùng' })
  @ApiResponse({ status: 200, description: 'User statistics' })
  async getUserStats(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const result = await this.analyticsService.getUserStats(startDate, endDate);

    return {
      success: true,
      data: result,
    };
  }

  @Get('booking-trends')
  @ApiOperation({ summary: 'Xu hướng booking' })
  @ApiResponse({ status: 200, description: 'Booking trends' })
  async getBookingTrends(@Query() query: AnalyticsQueryDto) {
    const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const result = await this.analyticsService.getBookingTrends(startDate, endDate);

    return {
      success: true,
      data: result,
    };
  }
}

