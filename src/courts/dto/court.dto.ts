import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourtDto {
  @ApiProperty({ example: 'Sân cầu lông ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Sân cầu lông chất lượng cao', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 106.6297 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: 10.8231 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: 'badminton' })
  @IsString()
  @IsNotEmpty()
  courtType: string;

  @ApiProperty({ example: ['parking', 'shower'], required: false })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  weekdayPrice?: number;

  @ApiProperty({ example: 150000, required: false })
  @IsNumber()
  @IsOptional()
  weekendPrice?: number;

  @ApiProperty({ example: 200000, required: false })
  @IsNumber()
  @IsOptional()
  peakHourPrice?: number;

  @ApiProperty({ example: '06:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  openTime?: string;

  @ApiProperty({ example: '22:00', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  closeTime?: string;

  @ApiProperty({ example: '0901234567', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'court@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;
}

export class UpdateCourtDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  weekdayPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  weekendPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  peakHourPrice?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  openTime?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  closeTime?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SearchCourtDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  courtType?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiProperty({ required: false, example: 5 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  radius?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiProperty({ required: false, example: 4 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ required: false, default: 'distance' })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({ required: false, default: 'asc' })
  @IsString()
  @IsOptional()
  sortOrder?: string;
}

