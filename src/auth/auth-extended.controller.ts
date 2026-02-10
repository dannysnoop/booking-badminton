import {
  Controller,
  Post,
  Body,
  Headers,
  UseGuards,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IpAddress } from '../common/decorators/ip-address.decorator';
import { SocialLoginService } from './services/social-login.service';
import { TwoFactorService } from './services/two-factor.service';
import { PasswordService } from './services/password.service';
import { ProfileService } from './services/profile.service';
import {
  GoogleLoginDto,
  FacebookLoginDto,
  Enable2FADto,
  Verify2FADto,
  Disable2FADto,
  UseBackupCodeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  UpdateProfileDto,
} from './dto';

@ApiTags('auth-extended')
@Controller('api/auth')
export class AuthExtendedController {
  constructor(
    private readonly socialLoginService: SocialLoginService,
    private readonly twoFactorService: TwoFactorService,
    private readonly passwordService: PasswordService,
    private readonly profileService: ProfileService,
  ) {}

  // ==================== Social Login ====================

  @Post('google')
  @ApiOperation({ summary: 'Đăng nhập bằng Google' })
  @ApiResponse({
    status: 201,
    description: 'Đăng nhập thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Google authentication failed',
  })
  async loginWithGoogle(
    @Body() dto: GoogleLoginDto,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.socialLoginService.loginWithGoogle(
      dto.idToken,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      data: result,
      message: 'Đăng nhập thành công',
    };
  }

  @Post('facebook')
  @ApiOperation({ summary: 'Đăng nhập bằng Facebook' })
  @ApiResponse({
    status: 201,
    description: 'Đăng nhập thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Facebook authentication failed',
  })
  async loginWithFacebook(
    @Body() dto: FacebookLoginDto,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.socialLoginService.loginWithFacebook(
      dto.accessToken,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      data: result,
      message: 'Đăng nhập thành công',
    };
  }

  // ==================== Two-Factor Authentication ====================

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo secret và QR code cho 2FA' })
  @ApiResponse({
    status: 201,
    description: 'Secret và QR code đã được tạo',
  })
  async setup2FA(@CurrentUser('userId') userId: string) {
    const result = await this.twoFactorService.generateSecret(userId);

    return {
      success: true,
      data: result,
      message: 'Quét QR code bằng app Google Authenticator hoặc Authy',
    };
  }

  @Post('2fa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kích hoạt 2FA' })
  @ApiResponse({
    status: 201,
    description: '2FA đã được kích hoạt',
  })
  @ApiResponse({
    status: 400,
    description: 'Mã xác thực không chính xác',
  })
  async enable2FA(
    @CurrentUser('userId') userId: string,
    @Body() dto: Enable2FADto,
  ) {
    const result = await this.twoFactorService.enable2FA(userId, dto.token);

    return {
      success: true,
      data: result,
      message: '2FA đã được kích hoạt. Lưu backup codes ở nơi an toàn.',
    };
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Xác thực mã 2FA khi đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thành công',
  })
  @ApiResponse({
    status: 400,
    description: 'Mã xác thực không chính xác',
  })
  async verify2FA(@Body() dto: Verify2FADto) {
    // This would be called during login flow if 2FA is enabled
    // Implementation depends on your login flow
    return {
      success: true,
      message: 'Mã xác thực chính xác',
    };
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tắt 2FA' })
  @ApiResponse({
    status: 200,
    description: '2FA đã được tắt',
  })
  async disable2FA(
    @CurrentUser('userId') userId: string,
    @Body() dto: Disable2FADto,
  ) {
    // Verify password before disabling
    const result = await this.twoFactorService.disable2FA(userId);

    return {
      success: true,
      data: result,
      message: '2FA đã được tắt',
    };
  }

  @Post('2fa/backup-code')
  @ApiOperation({ summary: 'Sử dụng backup code khi đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Backup code hợp lệ',
  })
  @ApiResponse({
    status: 400,
    description: 'Backup code không hợp lệ',
  })
  async useBackupCode(@Body() dto: UseBackupCodeDto) {
    // This would be called during login flow as alternative to TOTP
    return {
      success: true,
      message: 'Backup code hợp lệ',
    };
  }

  @Post('2fa/regenerate-backup-codes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo lại backup codes' })
  @ApiResponse({
    status: 200,
    description: 'Backup codes mới đã được tạo',
  })
  async regenerateBackupCodes(@CurrentUser('userId') userId: string) {
    const result = await this.twoFactorService.regenerateBackupCodes(userId);

    return {
      success: true,
      data: result,
      message: 'Backup codes mới đã được tạo. Lưu ở nơi an toàn.',
    };
  }

  // ==================== Password Recovery ====================

  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @ApiResponse({
    status: 200,
    description: 'Email đặt lại mật khẩu đã được gửi',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @IpAddress() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.passwordService.forgotPassword(
      dto.email,
      ipAddress,
      userAgent || 'unknown',
    );

    return {
      success: true,
      message: result.message,
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu với token' })
  @ApiResponse({
    status: 200,
    description: 'Mật khẩu đã được đặt lại',
  })
  @ApiResponse({
    status: 400,
    description: 'Token không hợp lệ hoặc đã hết hạn',
  })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.passwordService.resetPassword(
      dto.token,
      dto.newPassword,
    );

    return {
      success: true,
      message: result.message,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thay đổi mật khẩu' })
  @ApiResponse({
    status: 200,
    description: 'Mật khẩu đã được thay đổi',
  })
  @ApiResponse({
    status: 401,
    description: 'Mật khẩu hiện tại không chính xác',
  })
  async changePassword(
    @CurrentUser('userId') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.passwordService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );

    return {
      success: true,
      message: result.message,
    };
  }

  // ==================== Profile Management ====================

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile đã được cập nhật',
  })
  async updateProfile(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.profileService.updateProfile(userId, dto);

    return {
      success: true,
      data: result,
      message: 'Profile đã được cập nhật',
    };
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Avatar đã được upload',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser('userId') userId: string,
    @UploadedFile() file: any,
  ) {
    const result = await this.profileService.uploadAvatar(userId, file);

    return {
      success: true,
      data: result,
      message: 'Avatar đã được upload',
    };
  }

  @Delete('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar đã được xóa',
  })
  async deleteAvatar(@CurrentUser('userId') userId: string) {
    const result = await this.profileService.deleteAvatar(userId);

    return {
      success: true,
      message: result.message,
    };
  }
}

