import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { CreateSalonStaffRole } from './create-staff-member.dto';

export class UpdateStaffMemberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ enum: CreateSalonStaffRole })
  @IsOptional()
  @IsEnum(CreateSalonStaffRole)
  role?: CreateSalonStaffRole;

  @ApiPropertyOptional({ description: 'Job title (shown for stylists / staff profile)' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional({
    enum: UserStatus,
    description: 'ACTIVE = normal, SUSPENDED = temporarily blocked (cannot sign in), DISABLED = deactivated.',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

