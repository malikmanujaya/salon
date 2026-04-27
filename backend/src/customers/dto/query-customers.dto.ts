import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

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
}
