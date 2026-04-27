import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Salon roles that can be created via the staff management API (not CUSTOMER / SUPER_ADMIN). */
export enum CreateSalonStaffRole {
  RECEPTIONIST = 'RECEPTIONIST',
  SALON_OWNER = 'SALON_OWNER',
  STAFF = 'STAFF',
}

export class CreateStaffMemberDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  phone?: string;

  @ApiProperty({ enum: CreateSalonStaffRole })
  @IsEnum(CreateSalonStaffRole)
  role!: CreateSalonStaffRole;

  @ApiPropertyOptional({ description: 'Job title (shown for stylists / staff profile)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
