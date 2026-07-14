import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { AuthModule } from '@/auth/auth.module';
import { WarehousesModule } from '@/wharehouses/warehouse.module';
import { ProductsModule } from '@/products/products.module';
import { InventoryModule } from '@/inventory/inventory.module';
import { InboundOrdersModule } from '@/orders/inbound-orders/inbound-orders.module';

@Module({
  imports: [
    TerminusModule,
    AuthModule,
    WarehousesModule,
    ProductsModule,
    InventoryModule,
    InboundOrdersModule,
  ],
  providers: [RabbitMQHealthIndicator],
  controllers: [HealthController],
})
export class HealthModule {}
