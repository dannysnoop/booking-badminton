import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterResponseDto } from './dto/user-response.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ',
  })
  @ApiResponse({
    status: 409,
    description: 'Email hoặc số điện thoại đã tồn tại',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
      },
      message: 'Đăng ký thành công. Vui lòng xác thực tài khoản.',
    };
  }
}
