import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import {TicketPriority} from "../schemas/support-ticket.schema";

export class CreateTicketDto {
  @ApiProperty({ example: 'Không thể đặt sân' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Tôi gặp lỗi khi đặt sân...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'BOOKING', enum: ['BOOKING', 'PAYMENT', 'ACCOUNT', 'TECHNICAL', 'OTHER'] })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'MEDIUM', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], required: false })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  @IsOptional()
  priority?: TicketPriority;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class AddTicketMessageDto {
  @ApiProperty({ example: 'Cảm ơn bạn đã liên hệ...' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  attachments?: string[];
}

export class UpdateTicketStatusDto {
  @ApiProperty({ example: 'RESOLVED', enum: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'] })
  @IsEnum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED'])
  status: string;
}

export class CreateAbuseReportDto {
  @ApiProperty({ example: 'USER', enum: ['USER', 'COURT', 'REVIEW', 'BOOKING'] })
  @IsString()
  @IsNotEmpty()
  resourceType: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ example: 'SPAM', enum: ['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FRAUD', 'FAKE_PROFILE', 'OTHER'] })
  @IsEnum(['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FRAUD', 'FAKE_PROFILE', 'OTHER'])
  reason: string;

  @ApiProperty({ example: 'User này spam tin nhắn...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: [], required: false })
  @IsArray()
  @IsOptional()
  evidence?: string[];
}

export class ReviewAbuseReportDto {
  @ApiProperty({ example: 'RESOLVED', enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] })
  @IsEnum(['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'])
  status: string;

  @ApiProperty({ example: 'Đã xử lý vi phạm', required: false })
  @IsString()
  @IsOptional()
  resolution?: string;

  @ApiProperty({ example: 'WARNED', required: false })
  @IsString()
  @IsOptional()
  actionTaken?: string;
}

