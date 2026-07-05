import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@/products/products.entity';
import { Inventory } from '@/inventory/inventory.entity';
import { Warehouse } from './warehouses/warehouse.entity';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    TypeOrmModule.forFeature([Warehouse, Product, Inventory]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
