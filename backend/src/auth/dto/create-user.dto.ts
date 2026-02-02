import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email của người dùng',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Số điện thoại của người dùng',
  })
  @Matches(/^(0|\+84)[0-9]{9,10}$/, { message: 'Số điện thoại không hợp lệ' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phone: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mật khẩu (ít nhất 8 ký tự, chứa chữ hoa, chữ thường, số và ký tự đặc biệt)',
  })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ tên đầy đủ của người dùng',
  })
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;
}
