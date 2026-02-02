import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { RegisterDto, VerifyOtpDto, ResendOtpDto } from './dto';
import { IpAddress } from '../common/decorators/ip-address.decorator';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công',
  })
  @ApiResponse({
    status: 409,
    description: 'Email hoặc số điện thoại đã tồn tại',
  })
  @ApiResponse({
    status: 429,
    description: 'Quá nhiều yêu cầu đăng ký',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.register(
      registerDto,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      data: result,
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email/SMS để xác thực tài khoản.',
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Xác thực mã OTP' })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Mã OTP không hợp lệ hoặc hết hạn',
  })
  @ApiResponse({
    status: 429,
    description: 'Quá nhiều lần thử xác thực',
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(verifyOtpDto);

    return {
      success: true,
      data: result,
      message: 'Xác thực tài khoản thành công',
    };
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Gửi lại mã OTP' })
  @ApiResponse({
    status: 200,
    description: 'Gửi lại mã OTP thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'User không tồn tại hoặc đã xác thực',
  })
  @ApiResponse({
    status: 429,
    description: 'Quá nhiều yêu cầu gửi lại OTP',
  })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    const result = await this.authService.resendOtp(resendOtpDto);

    return {
      success: true,
      data: result,
      message: 'Mã OTP mới đã được gửi',
    };
  }
}
