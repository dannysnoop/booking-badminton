import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
  };

  beforeEach(async () => {
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
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      phone: '0912345678',
      password: 'Password123!',
      fullName: 'Test User',
    };

    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: createUserDto.email,
      phone: createUserDto.phone,
      passwordHash: 'hashedPassword',
      fullName: createUserDto.fullName,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(result).toEqual({
        success: true,
        data: {
          userId: mockUser.id,
          email: mockUser.email,
          phone: mockUser.phone,
          fullName: mockUser.fullName,
        },
        message: 'Đăng ký thành công. Vui lòng xác thực tài khoản.',
      });
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
    });

    it('should not include password in response', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(createUserDto);

      expect(result.data).not.toHaveProperty('passwordHash');
      expect(result.data).not.toHaveProperty('password');
    });
  });
});
