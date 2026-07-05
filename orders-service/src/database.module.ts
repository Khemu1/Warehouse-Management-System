import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundOrder } from '@/inbound-orders/entities/inbound-order.entity';
import { InboundOrderItem } from '@/inbound-orders/entities/inbound-order-item.entity';
import { InboundOrderFailure } from '@/inbound-orders/entities/inbound-order-failure.entity';

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
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
