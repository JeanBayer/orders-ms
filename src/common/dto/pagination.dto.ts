import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit: number = 10;
}
