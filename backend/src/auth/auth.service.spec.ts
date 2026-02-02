import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let configService: ConfigService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    configService = module.get<ConfigService>(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      phone: '0912345678',
      password: 'Password123!',
      fullName: 'Test User',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: createUserDto.email,
        phone: createUserDto.phone,
        passwordHash: hashedPassword,
        fullName: createUserDto.fullName,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null); // email check
      mockUserRepository.findOne.mockResolvedValueOnce(null); // phone check
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockConfigService.get.mockReturnValue(10);

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const result = await service.register(createUserDto);

      expect(result).toEqual(savedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        phone: createUserDto.phone,
        passwordHash: hashedPassword,
        fullName: createUserDto.fullName,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = { id: '1', email: createUserDto.email };
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Email đã tồn tại'),
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if phone already exists', async () => {
      const existingUser = { id: '1', phone: createUserDto.phone };
      mockUserRepository.findOne.mockResolvedValueOnce(null); // email check
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser); // phone check

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Số điện thoại đã tồn tại'),
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.create.mockReturnValue({});
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));
      mockConfigService.get.mockReturnValue(10);

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));

      await expect(service.register(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'Password123!';
      const saltRounds = 10;
      const hashedPassword = 'hashedPassword123';

      mockConfigService.get.mockReturnValue(saltRounds);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const result = await service.hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
    });
  });
});
