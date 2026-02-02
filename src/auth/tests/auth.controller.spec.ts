import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto, VerifyOtpDto, ResendOtpDto } from '../dto';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
      verifyOtp: jest.fn(),
      resendOtp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct params', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        phone: '0912345678',
        password: 'SecurePass123!',
        fullName: 'Test User',
      };

      const mockResult = {
        userId: 'user123',
        email: registerDto.email,
        phone: registerDto.phone,
        fullName: registerDto.fullName,
        status: 'pending',
        expiresAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const result = await controller.register(
        registerDto,
        '192.168.1.1',
        'TestAgent',
      );

      expect(mockAuthService.register).toHaveBeenCalledWith(
        registerDto,
        '192.168.1.1',
        'TestAgent',
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.message).toContain('Đăng ký thành công');
    });
  });

  describe('verifyOtp', () => {
    it('should call authService.verifyOtp with correct params', async () => {
      const verifyDto: VerifyOtpDto = {
        userId: 'user123',
        code: '123456',
      };

      const mockResult = {
        userId: 'user123',
        email: 'test@example.com',
        status: 'verified',
      };

      mockAuthService.verifyOtp.mockResolvedValue(mockResult);

      const result = await controller.verifyOtp(verifyDto);

      expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(verifyDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.message).toContain('Xác thực tài khoản thành công');
    });
  });

  describe('resendOtp', () => {
    it('should call authService.resendOtp with correct params', async () => {
      const resendDto: ResendOtpDto = {
        userId: 'user123',
        type: 'email',
      };

      const mockResult = {
        expiresAt: new Date(),
        nextResendAt: new Date(Date.now() + 60000),
      };

      mockAuthService.resendOtp.mockResolvedValue(mockResult);

      const result = await controller.resendOtp(resendDto);

      expect(mockAuthService.resendOtp).toHaveBeenCalledWith(resendDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(result.message).toContain('Mã OTP mới đã được gửi');
    });
  });
});
