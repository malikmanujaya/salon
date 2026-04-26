import { IsDateString } from 'class-validator';

export class QueryBookingsDto {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
