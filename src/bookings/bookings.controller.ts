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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BookingService } from './services/booking.service';
import { GroupService } from './services/group.service';
import { ChatService } from './services/chat.service';
import {
  CreateBookingDto,
  CreateGroupBookingDto,
  InviteMembersDto,
  RespondToInviteDto,
  SendMessageDto,
  UpdatePaymentStatusDto,
  CancelBookingDto,
} from './dto/booking.dto';

@ApiTags('bookings')
@Controller('api/bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly groupService: GroupService,
    private readonly chatService: ChatService,
  ) {}

  // ==================== Booking Management ====================

  @Post('individual')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo booking cá nhân' })
  @ApiResponse({ status: 201, description: 'Booking đã được tạo' })
  async createIndividualBooking(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.bookingService.createIndividualBooking(createBookingDto, userId);

    return {
      success: true,
      data: result,
      message: 'Booking đã được tạo',
    };
  }

  @Post('group')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo booking nhóm' })
  @ApiResponse({ status: 201, description: 'Group booking đã được tạo' })
  async createGroupBooking(
    @Body() createGroupBookingDto: CreateGroupBookingDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.bookingService.createGroupBooking(createGroupBookingDto, userId);

    return {
      success: true,
      data: result,
      message: 'Group booking đã được tạo',
    };
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách booking của user' })
  @ApiResponse({ status: 200, description: 'Danh sách booking' })
  async getMyBookings(
    @CurrentUser('userId') userId: string,
    @Query('status') status?: string,
  ) {
    const result = await this.bookingService.findUserBookings(userId, status);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem chi tiết booking' })
  @ApiResponse({ status: 200, description: 'Chi tiết booking' })
  async getBookingDetail(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.bookingService.findBookingById(id, userId);

    return {
      success: true,
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hủy booking' })
  @ApiResponse({ status: 200, description: 'Booking đã được hủy' })
  async cancelBooking(
    @Param('id') id: string,
    @Body() cancelDto: CancelBookingDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.bookingService.cancelBooking(id, userId, cancelDto);

    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== Group Booking - Invitation ====================

  @Post('group/:groupBookingId/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mời thành viên vào group booking' })
  @ApiResponse({ status: 201, description: 'Đã gửi lời mời' })
  async inviteMembers(
    @Param('groupBookingId') groupBookingId: string,
    @Body() inviteMembersDto: InviteMembersDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.groupService.inviteMembers(groupBookingId, inviteMembersDto, userId);

    return {
      success: true,
      data: result,
      message: `Đã mời ${result.invited} thành viên`,
    };
  }

  @Post('join/:inviteCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tham gia group booking bằng invite code' })
  @ApiResponse({ status: 200, description: 'Đã tham gia group' })
  async joinByInviteCode(
    @Param('inviteCode') inviteCode: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.groupService.joinByInviteCode(inviteCode, userId);

    return {
      success: true,
      data: result,
      message: 'Đã tham gia group',
    };
  }

  @Post('group/:groupBookingId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phản hồi lời mời' })
  @ApiResponse({ status: 200, description: 'Đã phản hồi' })
  async respondToInvite(
    @Param('groupBookingId') groupBookingId: string,
    @Body() respondDto: RespondToInviteDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.groupService.respondToInvite(groupBookingId, userId, respondDto);

    return {
      success: true,
      data: result,
      message: respondDto.response === 'ACCEPTED' ? 'Đã chấp nhận lời mời' : 'Đã từ chối lời mời',
    };
  }

  @Get('group/:groupBookingId/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách thành viên group' })
  @ApiResponse({ status: 200, description: 'Danh sách thành viên' })
  async getGroupMembers(
    @Param('groupBookingId') groupBookingId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.groupService.getGroupMembers(groupBookingId, userId);

    return {
      success: true,
      data: result,
    };
  }

  @Put('group/:groupBookingId/members/:memberId/payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái thanh toán của thành viên' })
  @ApiResponse({ status: 200, description: 'Đã cập nhật' })
  async updateMemberPayment(
    @Param('groupBookingId') groupBookingId: string,
    @Param('memberId') memberId: string,
    @Body() updateDto: UpdatePaymentStatusDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.groupService.updateMemberPaymentStatus(
      groupBookingId,
      memberId,
      updateDto,
      userId,
    );

    return {
      success: true,
      data: result,
      message: 'Đã cập nhật trạng thái thanh toán',
    };
  }

  @Delete('group/:groupBookingId/members/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa thành viên khỏi group' })
  @ApiResponse({ status: 200, description: 'Đã xóa thành viên' })
  async removeMember(
    @Param('groupBookingId') groupBookingId: string,
    @Param('memberId') memberId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.groupService.removeMember(groupBookingId, memberId, userId);

    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== Group Chat ====================

  @Post('group/:groupBookingId/chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi message trong group chat' })
  @ApiResponse({ status: 201, description: 'Message đã được gửi' })
  async sendMessage(
    @Param('groupBookingId') groupBookingId: string,
    @Body() sendMessageDto: SendMessageDto,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.chatService.sendMessage(groupBookingId, userId, sendMessageDto);

    return {
      success: true,
      data: result,
      message: 'Message đã được gửi',
    };
  }

  @Get('group/:groupBookingId/chat')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách messages' })
  @ApiResponse({ status: 200, description: 'Danh sách messages' })
  async getMessages(
    @Param('groupBookingId') groupBookingId: string,
    @CurrentUser('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    const result = await this.chatService.getMessages(groupBookingId, userId, +page, +limit);

    return {
      success: true,
      data: result.messages,
      pagination: result.pagination,
    };
  }

  @Delete('chat/:messageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa message' })
  @ApiResponse({ status: 200, description: 'Message đã được xóa' })
  async deleteMessage(
    @Param('messageId') messageId: string,
    @CurrentUser('userId') userId: string,
  ) {
    const result = await this.chatService.deleteMessage(messageId, userId);

    return {
      success: true,
      message: result.message,
    };
  }
}

