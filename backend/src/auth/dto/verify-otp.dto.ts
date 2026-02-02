import { IsUUID, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'uuid-here',
    description: 'ID của người dùng',
  })
  @IsUUID('4', { message: 'User ID không hợp lệ' })
  userId: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã OTP 6 chữ số',
  })
  @IsString()
  @Length(6, 6, { message: 'Mã OTP phải có 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Mã OTP chỉ chứa số' })
  code: string;
}
