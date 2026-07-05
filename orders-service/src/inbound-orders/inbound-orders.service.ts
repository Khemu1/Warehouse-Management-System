import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateInboundOrderDto,
  ReceiveInboundOrderDto,
} from '@shared/dtos/inbound-order.dtos';
import { InboundOrder } from './entities/inbound-order.entity';
import { InboundOrderItem } from './entities/inbound-order-item.entity';
import { Repository, In } from 'typeorm';
import { InBoundOrderStatus } from '@shared/types';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { ISafeClient } from '@shared/types';
import { InboundOrderFailure } from './entities/inbound-order-failure.entity';

@Injectable()
export class InboundOrdersService {
  constructor(
    @InjectQueue('order-processing') private orderProcessingQueue: Queue,
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
    @InjectRepository(InboundOrder)
    private inboundOrderRepo: Repository<InboundOrder>,
    @InjectRepository(InboundOrderItem)
    private inboundOrderItemRepo: Repository<InboundOrderItem>,
    @InjectRepository(InboundOrderItem)
    private failureRepo: Repository<InboundOrderFailure>,
  ) {}

  async create(dto: CreateInboundOrderDto) {
    console.log('before doesWarehouseExist');
    const warehouseExists = await this.inventoryClient.send(
      'doesWarehouseExist',
      {
        id: dto.warehouse_id,
      },
    );

    if (!warehouseExists) {
      throw new NotFoundException(`Warehouse ${dto.warehouse_id} not found`);
    }

    const productIds = dto.items.map((item) => item.product_id);
    console.log('before doesProductsExist ', productIds);

    const { allExist, missingIds } = await this.inventoryClient.send(
      'doesProductsExist',
      productIds,
    );
    if (!allExist) {
      throw new NotFoundException(
        `Products not found: ${missingIds.join(', ')}`,
      );
    }

    return this.inboundOrderRepo.manager.transaction(async (manager) => {
      const order = manager.create(InboundOrder, {
        warehouse_id: dto.warehouse_id,
        supplier_name: dto.supplier_name,
        created_by: dto.user_id,
      });
      const savedOrder = await manager.save(InboundOrder, order);

      const items = dto.items.map((item) =>
        manager.create(InboundOrderItem, {
          inbound_order_id: savedOrder.id,
          product_id: item.product_id,
          expected_quantity: item.expected_quantity,
          unit_cost: item.unit_cost,
        }),
      );
      const savedItems = await manager.save(InboundOrderItem, items);

      return { ...savedOrder, items: savedItems };
    });
  }

  findAll(warehouse_id?: string) {
    return this.inboundOrderRepo.find({
      where: warehouse_id ? { warehouse_id } : {},

      relations: { inbound_items: true },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const order = await this.inboundOrderRepo.findOne({
      where: { id },
      relations: { inbound_items: true },
    });
    if (!order) throw new NotFoundException(`Inbound order ${id} not found`);
    return order;
  }

  async receive(dto: ReceiveInboundOrderDto) {
    const order = await this.inboundOrderRepo.findOne({
      where: {
        id: dto.order_id,
      },
      select: {
        id: true,
        status: true,
      },
    });
    if (!order) throw new NotFoundException(`Order ${dto.order_id} wasn't found`);

    if (order?.status !== InBoundOrderStatus.PENDING) {
      throw new ConflictException(`Order ${dto.order_id} is not pending`);
    }

    const itemIds = dto.items.map((i) => i.item_id);
    const dbItems = await this.inboundOrderItemRepo.find({
      where: { id: In(itemIds), inbound_order_id: dto.order_id },
      select: {
        id: true,
        product_id: true,
      },
    });
    if (dbItems.length !== dto.items.length) {
      throw new NotFoundException(
        'One or more items do not belong to this order',
      );
    }

    await this.inboundOrderRepo.update(
      { id: dto.order_id },
      { status: InBoundOrderStatus.RECEIVING },
    );

    await this.orderProcessingQueue.add(
      'process_receive',
      { order_id: dto.order_id, items: dto.items },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return {
      order_id: dto.order_id,
      status: 'RECEIVING',
      message: 'Order is being processed in the background',
    };
  }

  async cancel(id: string) {
    const order = await this.findOne(id);
    if (order.status !== InBoundOrderStatus.PENDING) {
      throw new ConflictException(
        `Only pending orders can be cancelled — current status: ${order.status}`,
      );
    }
    order.status = InBoundOrderStatus.CANCELLED;
    await this.inboundOrderRepo.save(order);
  }

  async markNeedsAttention(data: {
    order_id: string;
    item_id: string;
    reason?: string;
    attempts?: number;
  }) {
    await this.inboundOrderItemRepo.update(
      { id: data.item_id },
      { received_quantity: 0 },
    );
    await this.inboundOrderRepo.update(
      { id: data.order_id },
      { status: InBoundOrderStatus.NEEDS_ATTENTION },
    );

    await this.failureRepo.insert({
      order_id: data.order_id,
      item_id: data.item_id,
      reason: data.reason ?? 'Stock update failed after max retries',
      attempts: data.attempts ?? 0,
    });
  }
}
