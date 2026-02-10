import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '0912345678' })
  phone: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  fullName: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: UserResponseDto })
  data: UserResponseDto;

  @ApiProperty({ example: 'Đăng ký thành công. Vui lòng xác thực tài khoản.' })
  message: string;
}
