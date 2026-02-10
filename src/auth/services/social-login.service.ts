import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshToken, RefreshTokenDocument } from '../schemas/refresh-token.schema';
import { LoginLog, LoginLogDocument } from '../schemas/login-log.schema';

@Injectable()
export class SocialLoginService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    @InjectModel(LoginLog.name)
    private loginLogModel: Model<LoginLogDocument>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async loginWithGoogle(idToken: string, ipAddress: string, userAgent: string) {
    try {
      // TODO: Verify Google ID token with google-auth-library
      // For now, stub implementation
      const mockPayload = {
        sub: 'google-123',
        email: 'user@gmail.com',
        name: 'Google User',
      };

      const { sub: providerId, email, name } = mockPayload;

      let user = await this.userModel.findOne({
        'authProviders.google.providerId': providerId,
      });

      if (!user) {
        user = await this.userModel.findOne({ email });

        if (user) {
          user.authProviders = {
            ...user.authProviders,
            google: { providerId, email },
          };
          await user.save();
        } else {
          user = await this.userModel.create({
            email,
            fullName: name || 'Google User',
            status: 'verified',
            authProviders: {
              google: { providerId, email },
            },
          });
        }
      }

      if (!user.isActive || user.isLocked) {
        throw new UnauthorizedException('Tài khoản không khả dụng');
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

      await this.loginLogModel.create({
        userId: user._id,
        eventType: 'login_success',
        ipAddress,
        userAgent,
        metadata: { provider: 'google' },
      });

      return {
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        provider: 'google',
      };
    } catch (error) {
      throw new UnauthorizedException('Google authentication failed: ' + error.message);
    }
  }

  async loginWithFacebook(accessToken: string, ipAddress: string, userAgent: string) {
    try {
      // TODO: Verify Facebook token with axios
      // For now, stub implementation
      const mockData = {
        id: 'facebook-123',
        email: 'user@facebook.com',
        name: 'Facebook User',
      };

      const { id: providerId, email, name } = mockData;

      let user = await this.userModel.findOne({
        'authProviders.facebook.providerId': providerId,
      });

      if (!user) {
        user = await this.userModel.findOne({ email });

        if (user) {
          user.authProviders = {
            ...user.authProviders,
            facebook: { providerId, email },
          };
          await user.save();
        } else {
          user = await this.userModel.create({
            email,
            fullName: name || 'Facebook User',
            status: 'verified',
            authProviders: {
              facebook: { providerId, email },
            },
          });
        }
      }

      if (!user.isActive || user.isLocked) {
        throw new UnauthorizedException('Tài khoản không khả dụng');
      }

      const jwtAccessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user, ipAddress, userAgent);

      await this.loginLogModel.create({
        userId: user._id,
        eventType: 'login_success',
        ipAddress,
        userAgent,
        metadata: { provider: 'facebook' },
      });

      return {
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        accessToken: jwtAccessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        provider: 'facebook',
      };
    } catch (error) {
      throw new UnauthorizedException('Facebook authentication failed: ' + error.message);
    }
  }

  private generateAccessToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '3600') as any,
    });
  }

  private async generateRefreshToken(
    user: UserDocument,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      type: 'refresh',
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'your-refresh-secret-key',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d' as any,
    });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }
}

