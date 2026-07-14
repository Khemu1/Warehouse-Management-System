import { OutboundOrderFailure } from '@/outbound-orders/entities/outbound-order-failure.entity';
import { OutboundOrderItem } from '@/outbound-orders/entities/outbound-order-item.entity';
import { OutboundOrder } from '@/outbound-orders/entities/outbound-order.entity';
import {
  Processor,
  WorkerHost,
  InjectQueue,
  OnWorkerEvent,
} from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { OutboundOrderStatus } from '@shared/types';
import { Job, Queue } from 'bullmq';
import { chunk } from 'lodash';
import { Repository } from 'typeorm';

const BATCH_SIZE = 100;

@Processor('outbound-order-processing')
export class OutboundOrdersProcessor extends WorkerHost {
  constructor(
    @InjectQueue('stock-updates') private stockQueue: Queue,
    @InjectRepository(OutboundOrder)
    private orderRepo: Repository<OutboundOrder>,
    @InjectRepository(OutboundOrderFailure)
    private failureRepo: Repository<OutboundOrderFailure>,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'process_reserve') return;
    console.log('process_reserve started');
    const {
      order_id,
      items,
    }: {
      order_id: string;
      items: { item_id: string; product_id: string; quantity: number }[];
    } = job.data;

    const order = await this.orderRepo.findOneOrFail({
      where: { id: order_id },
    });

    for (const batch of chunk(items, BATCH_SIZE)) {
      console.log(
        `order ${order_id}: processing batch of ${batch.length} items`,
      );

      await this.stockQueue.addBulk(
        batch.map((itemDto) => ({
          name: 'reserve_stock',
          data: {
            order_id,
            item_id: itemDto.item_id,
            warehouse_id: order.warehouse_id,
            product_id: itemDto.product_id,
            quantity: itemDto.quantity,
          },
          opts: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
          },
        })),
      );
    }
    await this.orderRepo.update(
      { id: order_id },
      { status: OutboundOrderStatus.RESERVED },
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) return;

    const { order_id } = job.data;
    console.error(
      `process_reserve failed permanently for order ${order_id}:`,
      error.message,
    );

    await this.orderRepo.update(
      { id: order_id },
      { status: OutboundOrderStatus.NEEDS_ATTENTION },
    );

    await this.failureRepo.insert({
      order_id,
      item_id: null,
      reason: `Reserve processing failed: ${error.message}`,
      attempts: job.attemptsMade,
    });
  }
}
