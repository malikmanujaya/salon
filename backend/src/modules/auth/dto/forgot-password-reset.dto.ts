import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordResetDto {
  @ApiProperty({ description: 'Phone number in local or intl format', example: '0719735641' })
  @IsString()
  @Matches(/^\+?\d{9,15}$/, { message: 'phone must be a valid number' })
  phone!: string;

  @ApiProperty({ description: 'Token returned by OTP verify endpoint' })
  @IsString()
  @MinLength(10)
  resetToken!: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}



