import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, phone, password, fullName } = createUserDto;

    // Check if email already exists
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('Email đã tồn tại');
    }

    // Check if phone already exists
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingUserByPhone) {
      throw new ConflictException('Số điện thoại đã tồn tại');
    }

    // Hash the password
    const passwordHash = await this.hashPassword(password);

    // Create and save the user
    const user = this.userRepository.create({
      email,
      phone,
      passwordHash,
      fullName,
    });

    try {
      return await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Lỗi khi tạo tài khoản');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 10;
    return await bcrypt.hash(password, saltRounds);
  }
}
