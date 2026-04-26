import { IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryCustomersDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}
