import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AppModule } from '../src/app.module';

describe('Auth Login & Profile E2E Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongoUri), AppModule],
    })
      .overrideModule(AppModule)

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Create and verify a user for login tests
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        phone: '0912345678',
        password: 'SecurePass123!',
        fullName: 'Test Login User',
      });

    const userId = registerResponse.body.data.userId;

    // Verify user with OTP (hardcoded as 123456 in demo)
    await request(app.getHttpServer())
      .post('/api/auth/verify')
      .send({
        userId: userId,
        code: '123456',
      });
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with email', async () => {
      const loginDto = {
        username: 'login@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('expiresAt');
      expect(response.body.message).toContain('Đăng nhập thành công');

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should login successfully with phone', async () => {
      const loginDto = {
        username: '0912345678',
        password: 'SecurePass123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for wrong password', async () => {
      const loginDto = {
        username: 'login@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('không chính xác');
    });

    it('should return 401 for non-existent user', async () => {
      const loginDto = {
        username: 'nonexistent@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('phone');
      expect(response.body.data).toHaveProperty('fullName');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.email).toBe('login@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('expiresAt');

      // Update tokens for subsequent tests
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Đăng xuất thành công');
    });

    it('should return 401 for logout without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .send({ refreshToken: 'some-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not be able to use revoked refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Account Locking', () => {
    beforeAll(async () => {
      // Create another user for locking test
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'locktest@example.com',
          phone: '0923456789',
          password: 'SecurePass123!',
          fullName: 'Lock Test User',
        });

      const userId = registerResponse.body.data.userId;

      await request(app.getHttpServer())
        .post('/api/auth/verify')
        .send({
          userId: userId,
          code: '123456',
        });
    });

    it('should lock account after 5 failed login attempts', async () => {
      const loginDto = {
        username: 'locktest@example.com',
        password: 'WrongPassword123!',
      };

      // Attempt 1-4: Should fail but not lock
      for (let i = 0; i < 4; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(loginDto)
          .expect(401);
      }

      // Attempt 5: Should lock the account
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.error.message).toContain('khóa');

      // Try with correct password - should still be locked
      const correctLoginDto = {
        username: 'locktest@example.com',
        password: 'SecurePass123!',
      };

      const lockedResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(correctLoginDto)
        .expect(401);

      expect(lockedResponse.body.error.message).toContain('khóa');
    });
  });
});

