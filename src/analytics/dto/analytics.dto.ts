import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @ApiProperty({ example: '2026-01-01', required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2026-02-10', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  courtId?: string;

  @ApiProperty({ required: false, default: 10 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'MANAGER' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Court Manager' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'Manages court operations', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['court:view', 'booking:view:all'] })
  permissions: string[];
}

export class UpdateRoleDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  permissions?: string[];
}

export class AssignRoleDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  userId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  roleId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  courtId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}

export class AuditLogQueryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false, default: 50 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

