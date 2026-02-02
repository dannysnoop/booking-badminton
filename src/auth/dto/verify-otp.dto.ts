import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'User ID' })
  @IsString()
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: string;

  @ApiProperty({ example: '123456', description: 'OTP code' })
  @IsString()
  @Length(6, 6, { message: 'Mã OTP phải có 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Mã OTP chỉ chứa số' })
  code: string;
}
