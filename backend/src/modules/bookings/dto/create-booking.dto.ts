import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** Prisma `cuid()` ids (not RFC UUIDs). */
const CUID_LIKE = { minLength: 8, maxLength: 128 } as const;

export class CreateBookingDto {
  /** Required for salon staff; omitted for `CUSTOMER` accounts (server uses your profile). */
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsString()
  @MinLength(CUID_LIKE.minLength)
  @MaxLength(CUID_LIKE.maxLength)
  customerId?: string;

  @IsDateString()
  startTime!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MinLength(CUID_LIKE.minLength, { each: true })
  @MaxLength(CUID_LIKE.maxLength, { each: true })
  serviceIds!: string[];

  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsString()
  @MinLength(CUID_LIKE.minLength)
  @MaxLength(CUID_LIKE.maxLength)
  staffId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}


