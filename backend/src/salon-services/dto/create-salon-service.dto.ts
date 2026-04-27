import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSalonServiceDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ minimum: 5 })
  @IsInt()
  @Min(5)
  durationMinutes!: number;

  @ApiProperty({ minimum: 0, description: 'Price in cents/minor units' })
  @IsInt()
  @Min(0)
  priceCents!: number;

  @ApiPropertyOptional({ default: 'LKR' })
  @IsOptional()
  @IsString()
  @MaxLength(12)
  currency?: string;

  @ApiPropertyOptional({ type: [String], description: 'Assigned staff profile ids' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  staffIds?: string[];
}

