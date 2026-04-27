import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { Gender } from '@prisma/client';

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  salonId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
