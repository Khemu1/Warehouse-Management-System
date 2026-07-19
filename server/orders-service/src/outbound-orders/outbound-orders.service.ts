import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOutboundOrderDto } from '@shared/dtos/outbound-order.dtos';
import { OutboundOrder } from './entities/outbound-order.entity';
import { OutboundOrderItem } from './entities/outbound-order-item.entity';
import { Repository } from 'typeorm';
import { OutboundOrderStatus, PaymentStatus } from '@shared/types';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { ISafeClient } from '@shared/types';
import { OutboundOrderFailure } from './entities/outbound-order-failure.entity';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class OutboundOrdersService {
  constructor(
    @InjectQueue('outbound-order-processing')
    private orderProcessingQueue: Queue,
    @InjectQueue('stock-updates')
    private stockProcessingQueue: Queue,

    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
    @Inject('PAYMENTS_SERVICE') private paymentClient: ISafeClient,
    @Inject('AUTH_SERVICE') private authClient: ISafeClient,
    @InjectRepository(OutboundOrder)
    private outboundOrderRepo: Repository<OutboundOrder>,
    @InjectRepository(OutboundOrderItem)
    private outboundOrderItemRepo: Repository<OutboundOrderItem>,
    @InjectRepository(OutboundOrderFailure)
    private failureRepo: Repository<OutboundOrderFailure>,
  ) {}

  async create(dto: CreateOutboundOrderDto) {
    await this.validateWarehouse(dto.warehouse_id);
    await this.validateStockAvailability(dto.warehouse_id, dto.items);

    const { savedOrder, savedItems } =
      await this.outboundOrderRepo.manager.transaction(async (manager) => {
        const totalAmount = dto.items.reduce(
          (sum, item) => sum + item.quantity * item.unit_cost,
          0,
        );

        const order = manager.create(OutboundOrder, {
          warehouse_id: dto.warehouse_id,
          customer_name: dto.customer_name,
          created_by: dto.user_id,
          total_amount: totalAmount,
          total_products: dto.items.length,
          status: OutboundOrderStatus.RESERVING,
        });
        const savedOrder = await manager.save(OutboundOrder, order);

        const items = dto.items.map((item) =>
          manager.create(OutboundOrderItem, {
            outbound_order_id: savedOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          }),
        );
        const savedItems = await manager.save(OutboundOrderItem, items);

        return { savedOrder, savedItems };
      });
    console.log(
      `[create] about to enqueue process_reserve for order ${savedOrder.id}`,
    );

    await this.orderProcessingQueue.add(
      'process_reserve',
      {
        order_id: savedOrder.id,
        items: savedItems.map((item) => ({
          item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );
    console.log(`[create] enqueued process_reserve for order ${savedOrder.id}`);

    return {
      ...savedOrder,
      items: savedItems,
      status: OutboundOrderStatus.RESERVING,
    };
  }
  private async validateWarehouse(warehouseId: string) {
    const warehouseExists = await this.inventoryClient.send(
      'doesWarehouseExist',
      { id: warehouseId },
    );
    if (!warehouseExists) {
      throw new NotFoundException(`Warehouse ${warehouseId} not found`);
    }
  }

  private async validateStockAvailability(
    warehouseId: string,
    items: { product_id: string; quantity: number }[],
  ) {
    const productIds = items.map((item) => item.product_id);
    const stockItems: {
      id: string;
      product_id: string;
      quantity: number;
      reserved_quantity: number;
    }[] = await this.inventoryClient.send('checkStock', {
      warehouse_id: warehouseId,
      product_ids: productIds,
    });

    const stockMap = new Map(
      (stockItems || []).map((s: any) => [s.product_id, s]),
    );

    const missingItems: string[] = [];
    const insufficientItems: {
      product_id: string;
      available: number;
      requested: number;
    }[] = [];

    for (const item of items) {
      const stock = stockMap.get(item.product_id);
      if (!stock) {
        missingItems.push(item.product_id);
      } else {
        const availableQuantity = stock.quantity - stock.reserved_quantity;
        if (availableQuantity < item.quantity) {
          insufficientItems.push({
            product_id: item.product_id,
            available: availableQuantity,
            requested: item.quantity,
          });
        }
      }
    }

    if (missingItems.length) {
      throw new NotFoundException(
        `Products not found in warehouse: ${missingItems.join(', ')}`,
      );
    }
    if (insufficientItems.length) {
      throw new ConflictException({
        message: 'Insufficient stock for one or more items',
        errors: insufficientItems,
      });
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    warehouse_id?: string,
  ): Promise<Pagination<OutboundOrder>> {
    const queryBuilder = this.outboundOrderRepo
      .createQueryBuilder('order')
      .leftJoin('order.outbound_items', 'items')
      .addSelect(['items.id'])
      .loadRelationCountAndMap('order.item_count', 'order.outbound_items')
      .orderBy('order.created_at', 'DESC');

    if (warehouse_id) {
      queryBuilder.andWhere('order.warehouse_id = :warehouse_id', {
        warehouse_id,
      });
    }

    if (search) {
      queryBuilder.andWhere('order.customer_name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return paginate<OutboundOrder>(queryBuilder, { page, limit });
  }

  async findOne(data: {
    id: string;
    returnAll?: boolean;
    specifiedColumns?: (keyof OutboundOrder)[];
    withRelations?: boolean;
    enrich?: boolean;
  }) {
    const order = await this.outboundOrderRepo.findOne({
      where: { id: data.id },
      select: data.returnAll ? undefined : data.specifiedColumns,
      relations:
        data.withRelations === false ? undefined : { outbound_items: true },
    });

    if (!order)
      throw new NotFoundException(`Outbound order ${data.id} not found`);

    if (!data.enrich) return order;

    const warehouse = await this.inventoryClient.send('findOneWarehouse', {
      id: order.warehouse_id,
    });

    const userIds = [
      order.created_by,
      order.confirmed_by,
      order.cancelled_by,
    ].filter(Boolean);
    const users = await this.authClient.send('findUsersByIds', userIds);
    const userMap: Map<string, { name: string }> = new Map(
      users.map((u: any) => [u.id, u]),
    );

    const productIds = order.outbound_items.map((item) => item.product_id);
    const products = await this.inventoryClient.send(
      'findProductsByIds',
      productIds,
    );
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    let failures: any[] = [];
    if (order.status === OutboundOrderStatus.NEEDS_ATTENTION) {
      failures = await this.failureRepo.find({
        where: { order_id: data.id, resolved: false },
        order: { created_at: 'DESC' },
      });
    }

    let payment: any = null;
    try {
      payment = await this.paymentClient.send('findPaymentForOrder', {
        order_id: data.id,
      });
    } catch {
      // Payment service might be down — don't fail the whole request
    }

    return {
      ...order,
      warehouse_name: warehouse?.name ?? 'Unknown',
      created_by_user: userMap.get(order.created_by) || null,
      confirmed_by_user: userMap.get(order.confirmed_by) || null,
      cancelled_by_user: userMap.get(order.cancelled_by) || null,
      created_by: undefined,
      confirmed_by: undefined,
      cancelled_by: undefined,
      failures,
      payment: payment || null,
      outbound_items: order.outbound_items.map((item) => ({
        ...item,
        product: productMap.get(item.product_id) || null,
      })),
    };
  }
  async reserve(order_id: string) {
    const order = await this.outboundOrderRepo.findOne({
      where: { id: order_id },
      select: { id: true, status: true },
    });
    if (!order) throw new NotFoundException(`Order ${order_id} wasn't found`);

    if (order?.status !== OutboundOrderStatus.PENDING) {
      throw new ConflictException(
        `Order ${order_id} is not pending — current status: ${order.status}`,
      );
    }

    // Get all items for this order
    const items = await this.outboundOrderItemRepo.find({
      where: { outbound_order_id: order_id },
      select: {
        id: true,
        product_id: true,
        quantity: true, // This is the expected quantity
      },
    });

    await this.outboundOrderRepo.update(
      { id: order_id },
      { status: OutboundOrderStatus.RESERVING },
    );

    await this.orderProcessingQueue.add(
      'process_reserve',
      {
        order_id,
        items: items.map((item) => ({
          item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity, // Send the expected quantity to reserve
        })),
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return {
      order_id,
      status: 'RESERVING',
      message: 'Order is being processed in the background',
    };
  }

  async retry(order_id: string) {
    const order = await this.outboundOrderRepo.findOne({
      where: { id: order_id },
      relations: { outbound_items: true },
    });

    if (!order) throw new NotFoundException(`Order ${order_id} not found`);
    if (order.status !== OutboundOrderStatus.NEEDS_ATTENTION) {
      throw new ConflictException('Only needs_attention orders can be retried');
    }

    await this.failureRepo.update(
      { order_id, resolved: false },
      { resolved: true },
    );

    // Determine which stage it failed at and retry
    const items = order.outbound_items.map((item) => ({
      item_id: item.id,
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    await this.outboundOrderRepo.update(
      { id: order_id },
      { status: OutboundOrderStatus.RESERVING },
    );

    await this.orderProcessingQueue.add(
      'process_reserve',
      { order_id, items },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return { order_id, status: 'RESERVING', message: 'Retry queued' };
  }

  async confirm(orderId: string, staffUserId: string) {
    const order = await this.outboundOrderRepo.findOneOrFail({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException("Order wasn't found");

    if (order.status !== OutboundOrderStatus.RESERVED)
      throw new ConflictException(
        `Cannot confirm order in status ${order.status}`,
      );

    const payment = await this.paymentClient.send('findPaymentForOrder', {
      order_id: orderId,
    });
    if (!payment || payment.status !== PaymentStatus.CONFIRMED) {
      throw new ConflictException('Order has no confirmed payment');
    }

    const items = await this.outboundOrderItemRepo.find({
      where: { outbound_order_id: orderId },
    });

    const { savedOrder } = await this.outboundOrderRepo.manager.transaction(
      async (manager) => {
        await manager.update(
          OutboundOrder,
          { id: orderId },
          {
            status: OutboundOrderStatus.CONFIRMED,
            confirmed_by: staffUserId,
            confirmed_at: new Date(),
          },
        );
        const savedOrder = await manager.findOneOrFail(OutboundOrder, {
          where: { id: orderId },
        });
        return { savedOrder };
      },
    );

    await this.stockProcessingQueue.addBulk(
      items.map((item) => ({
        name: 'fulfill_stock',
        data: {
          order_id: orderId,
          item_id: item.id,
          warehouse_id: order.warehouse_id,
          product_id: item.product_id,
          quantity: item.quantity,
        },
        opts: { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
      })),
    );

    return savedOrder;
  }

  async cancel(id: string, user_id: string) {
    const order = await this.outboundOrderRepo.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    if (
      order.status !== OutboundOrderStatus.PENDING &&
      order.status !== OutboundOrderStatus.RESERVED
    ) {
      throw new ConflictException(
        `Only pending or reserved orders can be cancelled — current status: ${order.status}`,
      );
    }

    const hadReservation = order.status === OutboundOrderStatus.RESERVED;

    const items = hadReservation
      ? await this.outboundOrderItemRepo.find({
          where: { outbound_order_id: id },
        })
      : [];

    await this.outboundOrderRepo.manager.transaction(async (manager) => {
      await manager.update(
        OutboundOrder,
        { id },
        {
          status: hadReservation
            ? OutboundOrderStatus.CANCELLING
            : OutboundOrderStatus.CANCELLED,
          cancelled_by: user_id,
        },
      );
    });

    if (hadReservation) {
      await this.stockProcessingQueue.addBulk(
        items.map((item) => ({
          name: 'cancel_stock',
          data: {
            order_id: id,
            item_id: item.id,
            warehouse_id: order.warehouse_id,
            product_id: item.product_id,
            quantity: item.quantity,
          },
          opts: { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
        })),
      );
    }
  }

  async markNeedsAttention(data: {
    order_id: string;
    item_id: string;
    reason?: string;
    attempts?: number;
  }) {
    await this.outboundOrderRepo.update(
      { id: data.order_id },
      { status: OutboundOrderStatus.NEEDS_ATTENTION },
    );

    await this.failureRepo.insert({
      order_id: data.order_id,
      item_id: data.item_id,
      reason: data.reason ?? 'Stock update failed after max retries',
      attempts: data.attempts ?? 0,
    });
  }

  async checkAllReserved(order_id: string) {
    const order = await this.outboundOrderRepo.findOne({
      where: { id: order_id },
      select: { id: true, status: true },
    });

    if (!order || order.status !== OutboundOrderStatus.RESERVING) return;

    const items = await this.outboundOrderItemRepo.find({
      where: { outbound_order_id: order_id },
      select: { id: true },
    });

    let allReserved = true;
    for (const item of items) {
      const moved = await this.inventoryClient.send('didItemMove', {
        idempotency_key: `${order_id}:${item.id}:reserve_stock`,
      });
      if (!moved) {
        allReserved = false;
        break;
      }
    }

    if (allReserved) {
      await this.outboundOrderRepo.update(
        { id: order_id },
        { status: OutboundOrderStatus.RESERVED },
      );
    }
  }

  async checkAllFulfilled(order_id: string) {
    const order = await this.outboundOrderRepo.findOne({
      where: { id: order_id },
      select: { id: true, status: true },
    });

    if (!order || order.status !== OutboundOrderStatus.CONFIRMED) return;

    const items = await this.outboundOrderItemRepo.find({
      where: { outbound_order_id: order_id },
      select: { id: true },
    });

    let allFulfilled = true;
    for (const item of items) {
      const moved = await this.inventoryClient.send('didItemMove', {
        idempotency_key: `${order_id}:${item.id}:fulfill_stock`,
      });
      if (!moved) {
        allFulfilled = false;
        break;
      }
    }

    if (allFulfilled) {
      await this.outboundOrderRepo.update(
        { id: order_id },
        { status: OutboundOrderStatus.SHIPPED },
      );
    }
  }

  async checkAllReleased(order_id: string) {
    const order = await this.outboundOrderRepo.findOne({
      where: { id: order_id },
      select: { id: true, status: true },
    });

    if (!order || order.status !== OutboundOrderStatus.CANCELLING) return;

    const items = await this.outboundOrderItemRepo.find({
      where: { outbound_order_id: order_id },
      select: { id: true },
    });

    let allReleased = true;
    for (const item of items) {
      const moved = await this.inventoryClient.send('didItemMove', {
        idempotency_key: `${order_id}:${item.id}:cancel_stock`,
      });
      if (!moved) {
        allReleased = false;
        break;
      }
    }

    if (allReleased) {
      await this.outboundOrderRepo.update(
        { id: order_id },
        { status: OutboundOrderStatus.CANCELLED },
      );
    }
  }
}
