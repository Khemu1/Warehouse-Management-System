import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from './inventory.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CheckStockDto } from '@shared/dtos/inventory.dtos';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private repo: Repository<Inventory>,
  ) {}

  async check(data: CheckStockDto) {
    return await this.repo.find({
      where: {
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
      },
      select: {
        id: true,
        quantity: true,
        reserved_quantity: true,
      },
    });
  }

  async reserve(data: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
  }) {
    return this.repo.manager.transaction(async (manager) => {
      const item = await manager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
        },
        lock: { mode: 'pessimistic_write' }, // this need to avoid any writes during the trans
      });

      if (!item)
        throw new NotFoundException("Item wasn't found in the inventory");

      const available = item.quantity - item.reserved_quantity;
      if (available < data.quantity) {
        throw new ConflictException('Insufficient stock available');
      }
      item.reserved_quantity += data.quantity;
      await manager.save(Inventory, item);

      return { reserved: true };
    });
  }

  async findWarehouseProducts(warehouse_id: string) {
    return this.repo.find({
      where: { warehouse_id },
      relations: { product: true },
      select: {
        id: true,
        quantity: true,
        reserved_quantity: true,
        created_at: true,
        product: {
          id: true,
          name: true,
          description: true,
          sku: true,
          unit_price: true,
          low_stock_threshold: true,
        },
      },
      order: { created_at: 'DESC' },
    });
  }
}
