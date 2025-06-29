import { Controller, Logger, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrderPaginationDto } from 'src/common/dto/order-pagination.dto';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaidOrderDto } from './dto/paid-order.dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);
    const paymentSessionUrl =
      await this.ordersService.createPaymentSession(order);

    return {
      order,
      paymentSessionUrl,
    };
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() orderPagination: OrderPaginationDto) {
    return this.ordersService.findAll(orderPagination);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('changeOrderStatus')
  changeOrderStatus(@Payload() changeOrderStatus: ChangeOrderStatusDto) {
    return this.ordersService.changeOrderStatus(changeOrderStatus);
  }

  @EventPattern('payment.succeeded')
  async paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    this.logger.log('[INIT][paidOrder]');
    const order = await this.ordersService.paidOrder(paidOrderDto);
    this.logger.log('[END][paidOrder]');
    return order;
  }
}
