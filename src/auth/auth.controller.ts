import { Controller, Post, Body, Headers, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { RegisterDto, VerifyOtpDto, ResendOtpDto, LoginDto, RefreshTokenDto, LogoutDto } from './dto';
import { IpAddress } from '../common/decorators/ip-address.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  RegisterResponseDto,
  VerifyResponseDto,
  ResendOtpResponseDto,
  LoginResponseDto,
  ProfileResponseDto,
} from './dto/responses';

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

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Thông tin đăng nhập không chính xác hoặc tài khoản bị khóa',
  })
  async login(
    @Body() loginDto: LoginDto,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.login(
      loginDto,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      data: result,
      message: 'Đăng nhập thành công',
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiResponse({
    status: 200,
    description: 'Làm mới token thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token không hợp lệ',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.refreshToken(
      refreshTokenDto,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      data: result,
      message: 'Làm mới token thành công',
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất' })
  @ApiResponse({
    status: 200,
    description: 'Đăng xuất thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(
    @Body() logoutDto: LogoutDto,
    @CurrentUser('userId') userId: string,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    await this.authService.logout(
      logoutDto,
      userId,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      message: 'Đăng xuất thành công',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin profile hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin profile thành công',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser('userId') userId: string) {
    const result = await this.authService.getProfile(userId);

    return {
      success: true,
      data: result,
    };
  }


}
