import { Module } from '@nestjs/common';
import { OrdersStatsService } from './orders-stats.service';
import { OrdersStatsController } from './order-stats.controller';

@Module({
  controllers: [OrdersStatsController],
  providers: [OrdersStatsService],
})
export class OrdersStatsModule {}
