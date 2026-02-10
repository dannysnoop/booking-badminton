/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/auth/entities/user.entity';
import { Repository } from 'typeorm';

describe('Auth E2E Tests', () => {
  let app: INestApplication<App>;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as in main.ts
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    // Clean up test data
    if (userRepository) {
      await userRepository.query('DELETE FROM users');
    }
    await app.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    if (userRepository) {
      await userRepository.query('DELETE FROM users');
    }
  });

  describe('/api/auth/register (POST)', () => {
    const validUserData = {
      email: 'test@example.com',
      phone: '0912345678',
      password: 'Password123!',
      fullName: 'Test User',
    };

    it('should register a new user successfully (201)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('userId');
          expect(res.body.data.email).toBe(validUserData.email);
          expect(res.body.data.phone).toBe(validUserData.phone);
          expect(res.body.data.fullName).toBe(validUserData.fullName);
          expect(res.body.data).not.toHaveProperty('password');
          expect(res.body.data).not.toHaveProperty('passwordHash');
          expect(res.body.message).toBe(
            'Đăng ký thành công. Vui lòng xác thực tài khoản.',
          );
        });
    });

    it('should return 400 for invalid email', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 400 for invalid phone number', () => {
      const invalidData = { ...validUserData, phone: '123' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 400 for weak password (less than 8 characters)', () => {
      const invalidData = { ...validUserData, password: 'Pass1!' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 400 for password without uppercase', () => {
      const invalidData = { ...validUserData, password: 'password123!' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 400 for password without lowercase', () => {
      const invalidData = { ...validUserData, password: 'PASSWORD123!' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 400 for password without number or special character', () => {
      const invalidData = { ...validUserData, password: 'PasswordOnly' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 400 for short full name', () => {
      const invalidData = { ...validUserData, fullName: 'A' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('BAD_REQUEST');
        });
    });

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to register with same email
      const duplicateData = {
        ...validUserData,
        phone: '0987654321', // different phone
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('CONFLICT');
          expect(res.body.error.message).toContain('Email đã tồn tại');
        });
    });

    it('should return 409 for duplicate phone', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to register with same phone
      const duplicateData = {
        ...validUserData,
        email: 'different@example.com', // different email
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(duplicateData)
        .expect(409)
        .expect((res) => {
          expect(res.body.success).toBe(false);
          expect(res.body.error.code).toBe('CONFLICT');
          expect(res.body.error.message).toContain('Số điện thoại đã tồn tại');
        });
    });

    it('should accept valid Vietnamese phone numbers', async () => {
      const phoneVariations = [
        { ...validUserData, email: 'test1@example.com', phone: '0912345678' },
        { ...validUserData, email: 'test2@example.com', phone: '0987654321' },
        {
          ...validUserData,
          email: 'test3@example.com',
          phone: '+84912345678',
        },
        {
          ...validUserData,
          email: 'test4@example.com',
          phone: '+84987654321',
        },
      ];

      for (const data of phoneVariations) {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(data)
          .expect(201);
      }
    });
  });
});
