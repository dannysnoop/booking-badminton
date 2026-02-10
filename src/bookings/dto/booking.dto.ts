import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  courtId: string;

  @ApiProperty({ example: '2026-02-15' })
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:mm format' })
  endTime: string;

  @ApiProperty({ example: 'GROUP', enum: ['INDIVIDUAL', 'GROUP'], required: false })
  @IsEnum(['INDIVIDUAL', 'GROUP'])
  @IsOptional()
  bookingType?: string;

  @ApiProperty({ example: 'Booking cho team ABC', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateGroupBookingDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  courtId: string;

  @ApiProperty({ example: '2026-02-15' })
  @IsDateString()
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  endTime: string;

  @ApiProperty({ example: 4, minimum: 2, maximum: 20 })
  @IsNumber()
  @Min(2, { message: 'Maximum members must be at least 2' })
  @Max(20, { message: 'Maximum members cannot exceed 20' })
  maxMembers: number;

  @ApiProperty({ example: 'EQUAL', enum: ['EQUAL', 'CUSTOM', 'HOST_PAY_FIRST'] })
  @IsEnum(['EQUAL', 'CUSTOM', 'HOST_PAY_FIRST'])
  splitMethod: string;

  @ApiProperty({ example: 'Đánh cầu lông team', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class InviteMembersDto {
  @ApiProperty({ example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'] })
  @IsString({ each: true })
  @IsNotEmpty()
  userIds: string[];

  @ApiProperty({ example: 'SMS', enum: ['SMS', 'IN_APP', 'LINK'], required: false })
  @IsEnum(['SMS', 'IN_APP', 'LINK'])
  @IsOptional()
  inviteMethod?: string;
}

export class RespondToInviteDto {
  @ApiProperty({ example: 'ACCEPTED', enum: ['ACCEPTED', 'DECLINED'] })
  @IsEnum(['ACCEPTED', 'DECLINED'])
  response: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'Tôi sẽ đến đúng giờ!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'TEXT', enum: ['TEXT', 'IMAGE'], required: false })
  @IsEnum(['TEXT', 'IMAGE'])
  @IsOptional()
  messageType?: string;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  attachments?: string[];
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ example: 'PAID', enum: ['PENDING', 'PAID', 'REFUNDED'] })
  @IsEnum(['PENDING', 'PAID', 'REFUNDED'])
  paymentStatus: string;
}

export class CancelBookingDto {
  @ApiProperty({ example: 'Không thể tham gia', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}

