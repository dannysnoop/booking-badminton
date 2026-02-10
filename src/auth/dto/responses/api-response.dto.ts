import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ example: 'RATE_LIMIT_EXCEEDED' })
  code: string;

  @ApiProperty({ example: 'Bạn đã đăng ký quá nhiều lần.' })
  message: string;

  @ApiProperty({ example: 900, required: false })
  retryAfter?: number;
}

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ type: ErrorDetailDto, required: false })
  error?: ErrorDetailDto;
}

