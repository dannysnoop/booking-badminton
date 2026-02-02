import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { VerificationCode } from '../src/auth/entities/verification-code.entity';
import { RegistrationLog } from '../src/auth/entities/registration-log.entity';

describe('Auth API (e2e)', () => {
  let app: INestApplication<App>;

  // Mock repositories
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockVerificationCodeRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockRegistrationLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
        AuthModule,
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(getRepositoryToken(VerificationCode))
      .useValue(mockVerificationCodeRepository)
      .overrideProvider(getRepositoryToken(RegistrationLog))
      .useValue(mockRegistrationLogRepository)
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
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/auth/register (POST)', () => {
    const validRegisterDto = {
      email: 'test@example.com',
      phone: '0912345678',
      password: 'SecurePass123!',
      fullName: 'Test User',
    };

    it('should register a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({
        id: 'test-user-id',
        ...validRegisterDto,
        passwordHash: 'hashed-password',
        status: 'pending',
      });
      mockUserRepository.save.mockResolvedValue({
        id: 'test-user-id',
        ...validRegisterDto,
        passwordHash: 'hashed-password',
        status: 'pending',
      });
      mockVerificationCodeRepository.save.mockResolvedValue({
        id: 'code-id',
        userId: 'test-user-id',
        code: '123456',
      });
      mockRegistrationLogRepository.create.mockReturnValue({});
      mockRegistrationLogRepository.save.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.email).toBe(validRegisterDto.email);
      expect(response.body.data.status).toBe('pending');
      expect(response.body.message).toContain('Đăng ký thành công');
    });

    it('should return 409 for duplicate email', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: 'existing-user',
        email: validRegisterDto.email,
      });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should return 409 for duplicate phone', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 'existing-user',
          phone: validRegisterDto.phone,
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validRegisterDto)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_PHONE');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validRegisterDto, email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toContain('Email không hợp lệ');
    });

    it('should return 400 for invalid phone', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validRegisterDto, phone: '123' })
        .expect(400);

      expect(response.body.message).toContain('Số điện thoại không hợp lệ');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validRegisterDto, password: 'weak' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for short fullName', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...validRegisterDto, fullName: 'A' })
        .expect(400);

      expect(response.body.message).toContain('Họ tên phải có ít nhất 2 ký tự');
    });
  });

  describe('/api/auth/verify (POST)', () => {
    const validVerifyDto = {
      userId: 'test-user-id',
      code: '123456',
    };

    it('should verify OTP successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        phone: '0912345678',
        status: 'pending',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockVerificationCodeRepository.findOne.mockResolvedValue({
        id: 'code-id',
        userId: 'test-user-id',
        code: '123456',
        attempts: 0,
        maxAttempts: 5,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        usedAt: null,
      });
      mockVerificationCodeRepository.save.mockResolvedValue({});
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        status: 'verified',
      });
      mockRegistrationLogRepository.create.mockReturnValue({});
      mockRegistrationLogRepository.save.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send(validVerifyDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('verified');
      expect(response.body.message).toContain('Xác thực tài khoản thành công');
    });

    it('should return 400 for invalid OTP code format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send({ ...validVerifyDto, code: '123' })
        .expect(400);

      expect(response.body.message).toContain('Mã OTP phải có 6 chữ số');
    });

    it('should return 400 for non-numeric OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send({ ...validVerifyDto, code: 'abcdef' })
        .expect(400);

      expect(response.body.message).toContain('Mã OTP chỉ chứa số');
    });

    it('should return 400 for invalid userId format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send({ ...validVerifyDto, userId: 'invalid-uuid' })
        .expect(400);

      expect(response.body.message).toContain('User ID không hợp lệ');
    });
  });

  describe('/api/auth/resend-otp (POST)', () => {
    const validResendDto = {
      userId: 'test-user-id',
      type: 'email',
    };

    it('should resend OTP successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        phone: '0912345678',
        status: 'pending',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRegistrationLogRepository.findOne.mockResolvedValue(null);
      mockRegistrationLogRepository.count.mockResolvedValue(2);
      mockVerificationCodeRepository.update.mockResolvedValue({});
      mockVerificationCodeRepository.save.mockResolvedValue({});
      mockRegistrationLogRepository.create.mockReturnValue({});
      mockRegistrationLogRepository.save.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-otp')
        .send(validResendDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.expiresAt).toBeDefined();
      expect(response.body.data.nextResendAt).toBeDefined();
      expect(response.body.message).toContain('Mã OTP mới đã được gửi');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-otp')
        .send({ ...validResendDto, type: 'invalid' })
        .expect(400);

      expect(response.body.message).toContain('Loại phải là email hoặc sms');
    });

    it('should return 400 for invalid userId', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/resend-otp')
        .send({ ...validResendDto, userId: 'invalid-uuid' })
        .expect(400);

      expect(response.body.message).toContain('User ID không hợp lệ');
    });
  });
});
