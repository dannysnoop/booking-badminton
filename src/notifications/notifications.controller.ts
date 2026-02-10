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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationService } from './services/notification.service';
import { SupportTicketService } from './services/support-ticket.service';
import { AbuseReportService } from './services/abuse-report.service';
import {
  CreateTicketDto,
  AddTicketMessageDto,
  UpdateTicketStatusDto,
  CreateAbuseReportDto,
  ReviewAbuseReportDto,
} from './dto/notifications.dto';

@ApiTags('notifications')
@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly ticketService: SupportTicketService,
    private readonly abuseReportService: AbuseReportService,
  ) {}

  // ==================== Notifications ====================

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách notifications' })
  @ApiResponse({ status: 200, description: 'User notifications' })
  async getNotifications(
    @CurrentUser('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.notificationService.getUserNotifications(userId, +page, +limit);

    return {
      success: true,
      data: result.notifications,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu notification đã đọc' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.notificationService.markAsRead(id, userId);

    return {
      success: true,
      data: result,
      message: 'Đã đánh dấu đã đọc',
    };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('userId') userId: string) {
    const result = await this.notificationService.markAllAsRead(userId);

    return {
      success: true,
      message: result.message,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.notificationService.deleteNotification(id, userId);

    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== Support Tickets ====================

  @Post('tickets')
  @ApiOperation({ summary: 'Tạo support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser('userId') userId: string,
  ) {
      const result = await this.ticketService.createTicket({
          userId,
          ...createTicketDto,
          priority: createTicketDto.priority ,
      });
    return {
      success: true,
      data: result,
      message: 'Ticket đã được tạo',
    };
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Lấy danh sách tickets của user' })
  @ApiResponse({ status: 200, description: 'User tickets' })
  async getUserTickets(
    @CurrentUser('userId') userId: string,
    @Query('status') status?: string,
  ) {
    const result = await this.ticketService.getUserTickets(userId, status);

    return {
      success: true,
      data: result,
    };
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Xem chi tiết ticket' })
  @ApiResponse({ status: 200, description: 'Ticket detail' })
  async getTicketDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.ticketService.getTicketById(id, userId);

    return {
      success: true,
      data: result,
    };
  }

  @Post('tickets/:id/messages')
  @ApiOperation({ summary: 'Thêm message vào ticket' })
  @ApiResponse({ status: 201, description: 'Message added' })
  async addTicketMessage(
    @Param('id') ticketId: string,
    @Body() messageDto: AddTicketMessageDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.ticketService.addMessage({
      ticketId,
      userId,
      message: messageDto.message,
      attachments: messageDto.attachments,
      isStaffReply: false,
    });

    return {
      success: true,
      data: result,
      message: 'Message đã được gửi',
    };
  }

  @Put('tickets/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái ticket' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateTicketStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.ticketService.updateTicketStatus(id, statusDto.status as any, userId);

    return {
      success: true,
      data: result,
      message: 'Trạng thái đã được cập nhật',
    };
  }

  // ==================== Abuse Reports ====================

  @Post('abuse-reports')
  @ApiOperation({ summary: 'Tạo báo cáo vi phạm' })
  @ApiResponse({ status: 201, description: 'Report created' })
  async createAbuseReport(
    @Body() reportDto: CreateAbuseReportDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.abuseReportService.createReport({
      reporterId: userId,
      ...reportDto,
      reason: reportDto.reason as any,
    });

    return {
      success: true,
      data: result,
      message: 'Báo cáo đã được gửi',
    };
  }

  @Get('abuse-reports')
  @ApiOperation({ summary: 'Lấy danh sách reports của user' })
  @ApiResponse({ status: 200, description: 'User reports' })
  async getUserReports(@CurrentUser('userId') userId: string) {
    const result = await this.abuseReportService.getUserReports(userId);

    return {
      success: true,
      data: result,
    };
  }

  @Get('abuse-reports/:id')
  @ApiOperation({ summary: 'Xem chi tiết report' })
  @ApiResponse({ status: 200, description: 'Report detail' })
  async getReportDetail(@Param('id') id: string) {
    const result = await this.abuseReportService.getReportById(id);

    return {
      success: true,
      data: result,
    };
  }

  // ==================== Admin Endpoints ====================

  @Get('admin/tickets')
  @ApiOperation({ summary: 'Lấy tất cả tickets (Admin)' })
  @ApiResponse({ status: 200, description: 'All tickets' })
  async getAllTickets(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.ticketService.getAllTickets({
      status,
      priority,
      category,
      assignedTo,
      page: +page,
      limit: +limit,
    });

    return {
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    };
  }

  @Get('admin/tickets/stats')
  @ApiOperation({ summary: 'Thống kê tickets (Admin)' })
  @ApiResponse({ status: 200, description: 'Ticket statistics' })
  async getTicketStats() {
    const result = await this.ticketService.getTicketStats();

    return {
      success: true,
      data: result,
    };
  }

  @Get('admin/abuse-reports')
  @ApiOperation({ summary: 'Lấy tất cả abuse reports (Admin)' })
  @ApiResponse({ status: 200, description: 'All abuse reports' })
  async getAllReports(
    @Query('status') status?: string,
    @Query('resourceType') resourceType?: string,
    @Query('reason') reason?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.abuseReportService.getAllReports({
      status,
      resourceType,
      reason,
      page: +page,
      limit: +limit,
    });

    return {
      success: true,
      data: result.reports,
      pagination: result.pagination,
    };
  }

  @Get('admin/abuse-reports/stats')
  @ApiOperation({ summary: 'Thống kê abuse reports (Admin)' })
  @ApiResponse({ status: 200, description: 'Report statistics' })
  async getReportStats() {
    const result = await this.abuseReportService.getReportStats();

    return {
      success: true,
      data: result,
    };
  }

  @Put('admin/abuse-reports/:id/review')
  @ApiOperation({ summary: 'Xử lý abuse report (Admin)' })
  @ApiResponse({ status: 200, description: 'Report reviewed' })
  async reviewReport(
    @Param('id') id: string,
    @Body() reviewDto: ReviewAbuseReportDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.abuseReportService.updateReportStatus(
      id,
      reviewDto.status as any,
      userId,
      reviewDto.resolution,
      reviewDto.actionTaken,
    );

    return {
      success: true,
      data: result,
      message: 'Report đã được xử lý',
    };
  }
}

