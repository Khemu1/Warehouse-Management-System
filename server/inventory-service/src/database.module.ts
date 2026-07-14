import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/products/products.entity';
import { Inventory } from '@/inventory/entities/inventory.entity';
import { Warehouse } from '@/warehouses/warehouse.entity';
import { StockMovement } from '@/inventory/entities/stock-movement.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forFeature([Warehouse, Product, Inventory, StockMovement]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
