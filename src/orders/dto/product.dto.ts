import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductItemDto {
  @IsPositive()
  @IsNumber()
  @Type(() => Number)
  public id: number;

  @IsString()
  public name: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public price: number;

  @IsBoolean()
  public available: boolean;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;
}

export class ProductDto {
  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductItemDto)
  items: ProductItemDto[];

  getProductById(id: number) {
    return this.items.find((item) => item.id === id);
  }
}
