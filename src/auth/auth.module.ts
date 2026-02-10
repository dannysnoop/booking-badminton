import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthController } from './auth.controller';
import { AuthExtendedController } from './auth-extended.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { RateLimitService } from './services/rate-limit.service';
import { NotificationService } from './services/notification.service';
import { SocialLoginService } from './services/social-login.service';
import { TwoFactorService } from './services/two-factor.service';
import { PasswordService } from './services/password.service';
import { ProfileService } from './services/profile.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from './schemas/user.schema';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './schemas/verification-code.schema';
import {
  RegistrationLog,
  RegistrationLogSchema,
} from './schemas/registration-log.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { LoginLog, LoginLogSchema } from './schemas/login-log.schema';
import { PasswordReset, PasswordResetSchema } from './schemas/password-reset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema },
      { name: RegistrationLog.name, schema: RegistrationLogSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: LoginLog.name, schema: LoginLogSchema },
      { name: PasswordReset.name, schema: PasswordResetSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '1h';
        return {
          secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
          signOptions: {
            expiresIn: expiresIn  as any,
          },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `avatar-${uniqueSuffix}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
    CacheModule.register(),
  ],
  controllers: [AuthController, AuthExtendedController],
  providers: [
    AuthService,
    OtpService,
    RateLimitService,
    NotificationService,
    SocialLoginService,
    TwoFactorService,
    PasswordService,
    ProfileService,
    JwtStrategy,
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
