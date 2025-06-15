/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';
import { ProductDto } from './product.dto';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({
    each: true,
  })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  getTotalQuantity(): number {
    return (
      this.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0
    );
  }

  getTotalAmount(): number {
    return (
      this.items?.reduce((sum, item) => sum + item.quantity * item.price, 0) ??
      0
    );
  }

  updatePriceItem(products: ProductDto) {
    const newItems = this.items.map((item) => {
      const price = products.getProductById(item.productId)?.price;

      if (!price) throw new Error('Product not found');

      return {
        ...item,
        price,
      };
    });

    this.items = newItems;
  }
}
