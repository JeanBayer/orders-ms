import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { NatsModule } from './transport/nats.module';

@Module({
  imports: [OrdersModule, NatsModule],
})
export class AppModule {}
