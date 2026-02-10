import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class Enable2FADto {
  @ApiProperty({
    description: 'TOTP code from authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'Mã xác thực phải có 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Mã xác thực chỉ chứa số' })
  token: string;
}

export class Verify2FADto {
  @ApiProperty({
    description: 'TOTP code from authenticator app',
    example: '123456',
  })
  @IsString()
  @Length(6, 6, { message: 'Mã xác thực phải có 6 chữ số' })
  @Matches(/^\d{6}$/, { message: 'Mã xác thực chỉ chứa số' })
  token: string;
}

export class Disable2FADto {
  @ApiProperty({
    description: 'Current password for verification',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password không được để trống' })
  password: string;
}

export class UseBackupCodeDto {
  @ApiProperty({
    description: 'Backup code',
    example: 'ABC123DEF456',
  })
  @IsString()
  @IsNotEmpty({ message: 'Backup code không được để trống' })
  backupCode: string;
}

