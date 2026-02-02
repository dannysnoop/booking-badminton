import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { RateLimitService } from './services/rate-limit.service';
import { NotificationService } from './services/notification.service';
import { User, UserSchema } from './schemas/user.schema';
import {
  VerificationCode,
  VerificationCodeSchema,
} from './schemas/verification-code.schema';
import {
  RegistrationLog,
  RegistrationLogSchema,
} from './schemas/registration-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema },
      { name: RegistrationLog.name, schema: RegistrationLogSchema },
    ]),
    CacheModule.register(),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    RateLimitService,
    NotificationService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
