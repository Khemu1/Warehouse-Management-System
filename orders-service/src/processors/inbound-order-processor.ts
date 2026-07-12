import { InboundOrderFailure } from '@/inbound-orders/entities/inbound-order-failure.entity';
import { InboundOrderItem } from '@/inbound-orders/entities/inbound-order-item.entity';
import { InboundOrder } from '@/inbound-orders/entities/inbound-order.entity';
import {
  Processor,
  WorkerHost,
  InjectQueue,
  OnWorkerEvent,
} from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { InBoundOrderStatus } from '@shared/types';
import { Job, Queue } from 'bullmq';
import { chunk } from 'lodash';
import { In, Repository } from 'typeorm';

const BATCH_SIZE = 100;

@Processor('inbound-order-processing')
export class ReceiveOrderProcessor extends WorkerHost {
  constructor(
    @InjectQueue('stock-updates') private stockQueue: Queue,
    @InjectRepository(InboundOrder) private orderRepo: Repository<InboundOrder>,
    @InjectRepository(InboundOrderItem)
    private itemRepo: Repository<InboundOrderItem>,
    @InjectRepository(InboundOrderFailure)
    private failureRepo: Repository<InboundOrderFailure>,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'process_receive') return;
    const {
      order_id,
      items,
    }: {
      order_id: string;
      items: { item_id: string; received_quantity: number }[];
    } = job.data;

    const order = await this.orderRepo.findOneOrFail({
      where: { id: order_id },
    });
    const dbItems = await this.itemRepo.find({
      where: { id: In(items.map((i) => i.item_id)) },
    });
    const dbItemsMap = new Map(dbItems.map((i) => [i.id, i]));

    let allFullyReceived = true;
    let totalAmount = 0;

    for (const batch of chunk(items, BATCH_SIZE)) {
      const toSave = batch.map((itemDto) => {
        const dbItem = dbItemsMap.get(itemDto.item_id)!;
        dbItem.received_quantity = itemDto.received_quantity;
        if (dbItem.received_quantity < dbItem.expected_quantity)
          allFullyReceived = false;
        totalAmount += dbItem.received_quantity * dbItem.unit_cost;

        return dbItem;
      });
      await this.itemRepo.save(toSave);
    }

    await this.orderRepo.update(
      { id: order_id },
      {
        status: allFullyReceived
          ? InBoundOrderStatus.RECEIVED
          : InBoundOrderStatus.PARTIALLY_RECEIVED,
        total_amount: totalAmount,
      },
    );

    // batch the stock-update job enqueueing
    for (const batch of chunk(items, BATCH_SIZE)) {
      await this.stockQueue.addBulk(
        batch.map((itemDto) => {
          const dbItem = dbItemsMap.get(itemDto.item_id)!;
          return {
            name: 'add_stock',
            data: {
              order_id,
              item_id: dbItem.id,
              warehouse_id: order.warehouse_id,
              product_id: dbItem.product_id,
              quantity: itemDto.received_quantity,
            },
            opts: {
              attempts: 5,
              backoff: { type: 'exponential', delay: 1000 },
            },
          };
        }),
      );
    }
  }
  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) return;

    const { order_id } = job.data;
    console.error(
      `process_receive failed permanently for order ${order_id}:`,
      error.message,
    );

    await this.orderRepo.update(
      { id: order_id },
      { status: InBoundOrderStatus.NEEDS_ATTENTION },
    );

    await this.failureRepo.insert({
      order_id,
      item_id: null,
      reason: `Receive processing failed: ${error.message}`,
      attempts: job.attemptsMade,
    });
  }
}
