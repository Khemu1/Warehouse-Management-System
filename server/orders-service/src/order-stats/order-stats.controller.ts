import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateInboundOrderMessageDto } from '@shared/dtos/inbound-order.dtos';
import { OrdersStatsService } from './orders-stats.service';

@Controller()
export class OrdersStatsController {
  constructor(private readonly ordersStatsService: OrdersStatsService) {}

  @MessagePattern('getOrderStats')
  async getOrderStats() {
    return this.ordersStatsService.getStats();
  }
  @MessagePattern('getRecentOrders')
  async getRecentOrders() {
    return this.ordersStatsService.getRecentOrders();
  }
}
