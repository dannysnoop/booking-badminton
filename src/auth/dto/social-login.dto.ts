import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID token from OAuth',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
  })
  @IsString()
  @IsNotEmpty({ message: 'ID token không được để trống' })
  idToken: string;
}

export class FacebookLoginDto {
  @ApiProperty({
    description: 'Facebook access token from OAuth',
    example: 'EAAGm0PX4ZCpsBO...',
  })
  @IsString()
  @IsNotEmpty({ message: 'Access token không được để trống' })
  accessToken: string;
}

