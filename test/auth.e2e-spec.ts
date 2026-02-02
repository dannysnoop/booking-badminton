import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let userId: string;

  beforeAll(async () => {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        AppModule,
      ],
    })
      .overrideModule(AppModule)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        phone: '0912345678',
        password: 'SecurePass123!',
        fullName: 'Nguyễn Văn A',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data.email).toBe(registerDto.email);
      expect(response.body.data.phone).toBe(registerDto.phone);
      expect(response.body.data.fullName).toBe(registerDto.fullName);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.message).toContain('Đăng ký thành công');

      userId = response.body.data.userId;
    });

    it('should return 409 for duplicate email', async () => {
      const registerDto = {
        email: 'test@example.com',
        phone: '0987654321',
        password: 'SecurePass123!',
        fullName: 'Nguyễn Văn B',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Email đã được sử dụng');
    });

    it('should return 400 for invalid email', async () => {
      const registerDto = {
        email: 'invalid-email',
        phone: '0912345678',
        password: 'SecurePass123!',
        fullName: 'Nguyễn Văn C',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid phone', async () => {
      const registerDto = {
        email: 'test2@example.com',
        phone: '123',
        password: 'SecurePass123!',
        fullName: 'Nguyễn Văn D',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const registerDto = {
        email: 'test3@example.com',
        phone: '0922222222',
        password: 'weak',
        fullName: 'Nguyễn Văn E',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/verify', () => {
    it('should return 400 for wrong OTP', async () => {
      const verifyDto = {
        userId: userId,
        code: '000000',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send(verifyDto)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Mã OTP không chính xác');
    });

    it('should return 400 for invalid OTP format', async () => {
      const verifyDto = {
        userId: userId,
        code: '12345',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send(verifyDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/resend-otp', () => {
    it('should resend OTP successfully', async () => {
      const resendDto = {
        userId: userId,
        type: 'email',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-otp')
        .send(resendDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('expiresAt');
      expect(response.body.data).toHaveProperty('nextResendAt');
      expect(response.body.message).toContain('Mã OTP mới đã được gửi');
    });

    it('should return 400 for invalid type', async () => {
      const resendDto = {
        userId: userId,
        type: 'invalid',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-otp')
        .send(resendDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
