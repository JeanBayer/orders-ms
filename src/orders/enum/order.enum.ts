import { OrderStatus } from 'generated/prisma';

export const OrderStatusList = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];
