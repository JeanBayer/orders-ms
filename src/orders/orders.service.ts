import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { PrismaClient } from 'generated/prisma';
import { firstValueFrom } from 'rxjs';
import { OrderPaginationDto } from 'src/common/dto/order-pagination.dto';
import { NATS_SERVICE } from 'src/config/services';
import { ChangeOrderStatusDto } from './dto/change-order-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemDto } from './dto/order-item.dto';
import { OrderResponse } from './dto/order-response.dto';
import { ProductDto, ProductItemDto } from './dto/product.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Prisma Client connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    const createOrder = plainToInstance(CreateOrderDto, createOrderDto);

    const products = await this.getValidatedProducts(
      createOrder.items.map((el) => el.productId),
    );

    createOrder.updatePriceItem(products);

    const order = await this.order.create({
      data: {
        totalAmount: createOrder.getTotalAmount(),
        totalItems: createOrder.getTotalQuantity(),
        orderItem: {
          createMany: {
            data: this.mapOrderItems(createOrder.items),
          },
        },
      },
      include: {
        orderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    return this.buildOrderResponse(order, products);
  }

  async findAll(orderPagination: OrderPaginationDto) {
    const { limit, page, status } = orderPagination;
    const totalPages = await this.order.count({
      where: {
        status,
      },
    });

    const orders = await this.order.findMany({
      where: {
        status,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: orders,
      meta: {
        total: totalPages,
        page,
        lastPage: Math.ceil(totalPages / limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
      include: {
        orderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true,
          },
        },
      },
    });

    if (!order) {
      this.logger.error(`Order with id ${id} not found`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    const productIds = order.orderItem.map((el) => el.productId);
    const products = await this.getValidatedProducts(productIds);

    this.logger.log(`Order with id ${id} found successfully`);
    return this.buildOrderResponse(order, products);
  }

  async changeOrderStatus(changeOrderStatus: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatus;

    const order = await this.findOne(id);

    if (order.status === status) {
      return {
        ...order,
        orderItem: undefined,
      };
    }

    return this.order.update({
      where: { id },
      data: { status },
    });
  }

  private async getValidatedProducts(
    productIds: number[],
  ): Promise<ProductDto> {
    const productItems: ProductItemDto[] = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, productIds),
    );
    return plainToInstance(ProductDto, { items: productItems });
  }

  private mapOrderItems(items: OrderItemDto[]) {
    return items.map((item) => ({
      price: item.price,
      productId: item.productId,
      quantity: item.quantity,
    }));
  }

  private buildOrderResponse(order: any, products: ProductDto): OrderResponse {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ...order,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      orderItem: order?.orderItem?.map((item) => ({
        ...item,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        name: products.getProductById(item?.productId)?.name || '',
      })),
    };
  }
}
