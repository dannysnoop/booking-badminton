import { IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    example: 'uuid-here',
    description: 'ID của người dùng',
  })
  @IsUUID('4', { message: 'User ID không hợp lệ' })
  userId: string;

  @ApiProperty({
    example: 'email',
    description: 'Loại gửi OTP (email hoặc sms)',
    enum: ['email', 'sms'],
  })
  @IsIn(['email', 'sms'], { message: 'Loại phải là email hoặc sms' })
  type: 'email' | 'sms';
}
