import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class QueryCustomersDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  salonId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({ description: 'Include blocked and deactivated customers' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1' || value === 1)
  @IsBoolean()
  includeInactive?: boolean;
}


