import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsOptional, IsArray } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 to 5 stars'
  })
  @IsNumber()
  @Min(1, { message: 'Rating phải từ 1 đến 5' })
  @Max(5, { message: 'Rating phải từ 1 đến 5' })
  rating: number;

  @ApiProperty({
    example: 'Sân đẹp, dịch vụ tốt, giá cả hợp lý',
    description: 'Review comment'
  })
  @IsString()
  @IsNotEmpty({ message: 'Comment không được để trống' })
  comment: string;

  @ApiProperty({
    example: [],
    required: false,
    description: 'Image URLs for review'
  })
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateReviewDto {
  @ApiProperty({
    required: false,
    example: 4,
    minimum: 1,
    maximum: 5
  })
  @IsNumber()
  @IsOptional()
  @Min(1, { message: 'Rating phải từ 1 đến 5' })
  @Max(5, { message: 'Rating phải từ 1 đến 5' })
  rating?: number;

  @ApiProperty({
    required: false,
    example: 'Updated review comment'
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    required: false,
    example: []
  })
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class OwnerReplyDto {
  @ApiProperty({
    example: 'Cảm ơn bạn đã đánh giá! Chúng tôi rất vui khi được phục vụ bạn.',
    description: 'Owner reply to review'
  })
  @IsString()
  @IsNotEmpty({ message: 'Reply không được để trống' })
  reply: string;
}

