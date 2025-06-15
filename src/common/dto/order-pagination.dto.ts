import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatusList } from 'src/orders/enum/order.enum';
import { PaginationDto } from './pagination.dto';
import { OrderStatus } from 'generated/prisma';

export class OrderPaginationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OrderStatusList, {
    message: `Status must be one of the following: ${Object.values(OrderStatusList).join(', ')}`,
  })
  status?: OrderStatus;
}
