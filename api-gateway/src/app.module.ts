import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GlobalErrorFilter } from '@shared/filters/global-error.filter';
import { WarehousesModule } from './wharehouses/warehouse.module';
import { JwtModule } from './jwt/jwt.module';
import { AppClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { InboundOrdersModule } from './orders/inbound-orders/inbound-orders.module';
import { HealthModule } from './health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    AppClientsModule,
    HealthModule,
    JwtModule,
    AuthModule,
    WarehousesModule,
    ProductsModule,
    InventoryModule,
    InboundOrdersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalErrorFilter,
    },
  ],
})
export class AppModule {}
