import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, QueryFailedError, Repository } from 'typeorm';
import { CheckStockDto, ReserveStockDto } from '@shared/dtos/inventory.dtos';
import { Inventory } from './entities/inventory.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Product } from '@/products/products.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private repo: Repository<Inventory>,
    @InjectRepository(Product) private productRepo: Repository<Product>,

    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    warehouse_id?: string,
  ): Promise<Pagination<Inventory>> {
    const queryBuilder = this.repo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.warehouse', 'warehouse');

    if (warehouse_id) {
      queryBuilder.andWhere('inventory.warehouse_id = :warehouse_id', {
        warehouse_id,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .select([
        'inventory.id',
        'inventory.quantity',
        'inventory.reserved_quantity',
        'product.id',
        'product.name',
        'product.sku',
        'product.low_stock_threshold',
        'warehouse.id',
        'warehouse.name',
      ])
      .orderBy('product.name', 'ASC');

    return paginate<Inventory>(queryBuilder, { page, limit });
  }

  async getDashboardStats() {
    const [productCount, lowStockCount, totalStock] = await Promise.all([
      this.productRepo.count(),
      this.repo
        .createQueryBuilder('inventory')
        .leftJoin('inventory.product', 'product')
        .where(
          'inventory.quantity - inventory.reserved_quantity <= product.low_stock_threshold',
        )
        .getCount(),
      this.repo
        .createQueryBuilder('inventory')
        .select('SUM(inventory.quantity)', 'total')
        .getRawOne(),
    ]);

    return {
      totalProducts: productCount,
      lowStockCount,
      totalStockQuantity: parseInt(totalStock?.total || '0'),
    };
  }

  async check(data: CheckStockDto) {
    const result = await this.repo.find({
      where: {
        warehouse_id: data.warehouse_id,
        product_id: In(data.product_ids),
      },
      select: {
        id: true,
        product_id: true,
        quantity: true,
        reserved_quantity: true,
      },
    });
    return result;
  }

  async reserve(data: ReserveStockDto) {
    return this.repo.manager.transaction(async (manager) => {
      const productIds = data.items.map((i) => i.product_id);

      const stockItems = await manager.find(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          product_id: In(productIds),
        },
        lock: { mode: 'pessimistic_write' },
      });

      const stockByProductId = new Map(
        stockItems.map((item) => [item.product_id, item]),
      );

      const missingItems: string[] = [];
      const insufficientItems: {
        product_id: string;
        requested: number;
        available: number;
      }[] = [];
      const itemsToReserve: { item: Inventory; quantity: number }[] = [];

      for (const { product_id, quantity } of data.items) {
        const item = stockByProductId.get(product_id);

        if (!item) {
          missingItems.push(product_id);
          continue;
        }

        const available = item.quantity - item.reserved_quantity;
        if (available < quantity) {
          insufficientItems.push({
            product_id,
            requested: quantity,
            available,
          });
          continue;
        }

        itemsToReserve.push({ item, quantity });
      }

      if (missingItems.length) {
        throw new NotFoundException({
          message: 'Some items were not found in the inventory',
          missingItems,
        });
      }

      if (insufficientItems.length) {
        throw new ConflictException({
          message: 'Insufficient stock available for some items',
          insufficientItems,
        });
      }

      for (const { item, quantity } of itemsToReserve) {
        item.reserved_quantity += quantity;
      }
      await manager.save(
        Inventory,
        itemsToReserve.map(({ item }) => item),
      );

      return { reserved: true };
    });
  }

  async reserveItem(data: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    console.log('reserveItem');
    return this.repo.manager.transaction(async (manager) => {
      try {
        await manager.insert(StockMovement, {
          idempotency_key: data.idempotency_key,
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
          quantity: data.quantity,
          type: 'reservation',
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

      const item = await manager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) {
        throw new NotFoundException(
          `Item ${data.product_id} wasn't found in the inventory`,
        );
      }

      const available = item.quantity - item.reserved_quantity;
      if (available < data.quantity) {
        throw new ConflictException(
          `Insufficient stock available for product ${data.product_id}`,
        );
      }
      console.log('before', item.reserved_quantity);

      item.reserved_quantity += data.quantity;
      console.log('after ', item.reserved_quantity);
      await manager.save(Inventory, item);

      return { alreadyApplied: false };
    });
  }

  async fulfillItem(data: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    return this.repo.manager.transaction(async (manager) => {
      try {
        await manager.insert(StockMovement, {
          idempotency_key: data.idempotency_key,
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
          quantity: data.quantity,
          type: 'outbound_ship',
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

      const item = await manager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) {
        throw new NotFoundException(
          `Item ${data.product_id} wasn't found in the inventory`,
        );
      }

      if (item.reserved_quantity < data.quantity) {
        throw new ConflictException(
          `Fulfillment quantity (${data.quantity}) exceeds reserved quantity ` +
            `(${item.reserved_quantity}) for product ${data.product_id} — ` +
            `possible state mismatch, needs investigation`,
        );
      }
      if (item.quantity < data.quantity) {
        throw new ConflictException(
          `Fulfillment quantity (${data.quantity}) exceeds on-hand quantity ` +
            `(${item.quantity}) for product ${data.product_id}`,
        );
      }

      item.quantity -= data.quantity;
      item.reserved_quantity -= data.quantity;
      await manager.save(Inventory, item);

      return { alreadyApplied: false };
    });
  }

  async releaseReservation(data: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    return this.repo.manager.transaction(async (manager) => {
      try {
        await manager.insert(StockMovement, {
          idempotency_key: data.idempotency_key,
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
          quantity: data.quantity,
          type: 'reversal',
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

      const item = await manager.findOne(Inventory, {
        where: {
          warehouse_id: data.warehouse_id,
          product_id: data.product_id,
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (!item) {
        throw new NotFoundException(
          `Item ${data.product_id} wasn't found in the inventory`,
        );
      }

      if (item.reserved_quantity < data.quantity) {
        throw new ConflictException(
          `Release quantity (${data.quantity}) exceeds reserved quantity ` +
            `(${item.reserved_quantity}) for product ${data.product_id} — ` +
            `possible state mismatch, needs investigation`,
        );
      }

      // quantity untouched — stock never left the warehouse
      item.reserved_quantity -= data.quantity;
      await manager.save(Inventory, item);

      return { alreadyApplied: false };
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
    let item = await this.repo.findOne({
      where: {
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
      },
    });
    if (!item) {
      // First time this product enters this warehouse — create the inventory row
      item = this.repo.create({
        warehouse_id: data.warehouse_id,
        product_id: data.product_id,
        quantity: 0,
        reserved_quantity: 0,
      });
      await this.repo.save(item);
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
  async getWarehouseTotalStock(warehouse_id: string) {
    return this.repo
      .createQueryBuilder('inventory')
      .select('COALESCE(SUM(inventory.quantity), 0)', 'total')
      .where('inventory.warehouse_id = :warehouse_id', { warehouse_id })
      .getRawOne();
  }
}
