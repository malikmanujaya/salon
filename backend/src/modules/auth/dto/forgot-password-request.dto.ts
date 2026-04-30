import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({ description: 'Phone number in local or intl format', example: '0719735641' })
  @IsString()
  @Matches(/^\+?\d{9,15}$/, { message: 'phone must be a valid number' })
  phone!: string;
}



