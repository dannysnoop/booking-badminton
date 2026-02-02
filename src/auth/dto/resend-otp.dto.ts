import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'User ID' })
  @IsString()
  @IsNotEmpty({ message: 'User ID không được để trống' })
  userId: string;

  @ApiProperty({ example: 'email', description: 'OTP type', enum: ['email', 'sms'] })
  @IsIn(['email', 'sms'], { message: 'Loại phải là email hoặc sms' })
  type: 'email' | 'sms';
}
