import { ApiProperty } from '@nestjs/swagger';

export class RegisterDataDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  userId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '0912345678' })
  phone: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName: string;

  @ApiProperty({ example: 'pending', enum: ['pending', 'verified', 'locked'] })
  status: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: RegisterDataDto })
  data: RegisterDataDto;

  @ApiProperty({ example: 'Đăng ký thành công. Vui lòng kiểm tra email/SMS để xác thực tài khoản.' })
  message: string;
}

