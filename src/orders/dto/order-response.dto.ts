import { OrderStatus } from 'generated/prisma';

export interface OrderItemResponse {
  price: number;
  quantity: number;
  productId: string;
  name: string;
}

export interface OrderResponse {
  id: string;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  orderItem: OrderItemResponse[];
}
