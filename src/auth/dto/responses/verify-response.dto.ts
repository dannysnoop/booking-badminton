import { ApiProperty } from '@nestjs/swagger';

export class VerifyDataDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'verified', enum: ['pending', 'verified', 'locked'] })
  status: string;
}

export class VerifyResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: VerifyDataDto })
  data: VerifyDataDto;

  @ApiProperty({ example: 'Xác thực tài khoản thành công' })
  message: string;
}

export class VerifyErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Mã OTP không chính xác' })
  message: string;

  @ApiProperty({ example: 3, required: false })
  attemptsLeft?: number;
}

