import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDataDto {
  @ApiProperty({ example: '2026-02-10T10:30:00.000Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2026-02-10T10:21:00.000Z' })
  nextResendAt: Date;
}

export class ResendOtpResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: ResendOtpDataDto })
  data: ResendOtpDataDto;

  @ApiProperty({ example: 'Mã OTP mới đã được gửi' })
  message: string;
}

