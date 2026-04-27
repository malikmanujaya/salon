import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL or data URI' })
  @IsOptional()
  @IsString()
  @MaxLength(2_000_000)
  avatarUrl?: string;
}

