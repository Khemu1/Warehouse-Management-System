import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CheckStockDto } from '@shared/dtos/inventory.dtos';
import { Inventory } from './entities/inventory.entity';
import { StockMovement } from './entities/stock-movement.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private repo: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,
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

  async addStock(data: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    const item = await this.repo.findOne({
      where: {
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
      },
    });
    if (!item) {
      throw new NotFoundException("Item wasn't found to be added");
    }

    // save record the movement
    try {
      await this.movementRepo.insert({
        idempotency_key: data.idempotency_key,
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
        quantity: data.quantity,
        type: 'inbound_receive',
      });
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as any).driverError?.code === '23505'
      ) {
        return { alreadyApplied: true };
      }
      throw err;
    }

    await this.repo
      .createQueryBuilder()
      .update(Inventory)
      .set({ quantity: () => `quantity + ${data.quantity}` })
      .where('warehouse_id = :warehouse_id', {
        warehouse_id: data.warehouse_id,
      })
      .andWhere('product_id = :product_id', { product_id: data.product_id })
      .execute();

    return { alreadyApplied: false };
  }

  async didItemMove(idempotency_key: string) {
    const movement = await this.movementRepo.findOne({
      where: { idempotency_key },
      select: {
        idempotency_key: true,
      },
    });
    return movement;
  }
}
