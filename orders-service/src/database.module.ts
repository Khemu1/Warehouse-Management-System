import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundOrder } from '@/inbound-orders/entities/inbound-order.entity';
import { InboundOrderItem } from '@/inbound-orders/entities/inbound-order-item.entity';
import { InboundOrderFailure } from '@/inbound-orders/entities/inbound-order-failure.entity';
import { OutboundOrderFailure } from './outbound-orders/entities/outbound-order-failure.entity';
import { OutboundOrderItem } from './outbound-orders/entities/outbound-order-item.entity';
import { OutboundOrder } from './outbound-orders/entities/outbound-order.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forFeature([
      InboundOrder,
      InboundOrderItem,
      InboundOrderFailure,
      OutboundOrder,
      OutboundOrderItem,
      OutboundOrderFailure,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
