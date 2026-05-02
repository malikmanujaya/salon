import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordVerifyDto {
  @ApiProperty({ description: 'Phone number in local or intl format', example: '0719735641' })
  @IsString()
  @Matches(/^\+?\d{9,15}$/, { message: 'phone must be a valid number' })
  phone!: string;

  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
  otp!: string;
}



