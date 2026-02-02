import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { OtpService } from './services/otp.service';
import { NotificationService } from './services/notification.service';
import { User } from './entities/user.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { RegistrationLog } from './entities/registration-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerificationCode, RegistrationLog]),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, NotificationService],
  exports: [AuthService, OtpService],
})
export class AuthModule {}
