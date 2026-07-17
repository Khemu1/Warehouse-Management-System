import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GlobalErrorFilter } from '@shared/filters/global-error.filter';
import { WarehousesModule } from './wharehouses/warehouse.module';
import { JwtModule } from './jwt/jwt.module';
import { AppClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { InboundOrdersModule } from './orders/inbound-orders/inbound-orders.module';
import { HealthModule } from './health/health.module';
import { OutboundOrdersModule } from './orders/outbound-orders/outbound-orders.module';
import { PaymentsModule } from './payments/payments.module';
import { RateLimiterGuard } from '../../shared/src/guards/rate-limiter.guard';
import { DashboardModule } from './dashboard/dashboard.module';
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
    OutboundOrdersModule,
    PaymentsModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
  ],
})
export class AppModule {}
