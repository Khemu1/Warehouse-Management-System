// inventory-service: stock-updates.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { InventoryService } from '../inventory.service';
import type { ISafeClient } from '@shared/types';

@Processor('stock-updates')
export class StockUpdatesProcessor extends WorkerHost {
  constructor(
    private inventoryService: InventoryService,
    @Inject('ORDERS_SERVICE') private ordersClient: ISafeClient,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'add_stock') {
      const {
        order_id,
        item_id,
        warehouse_id,
        product_id,
        quantity,
      }: {
        order_id: string;
        item_id: string;
        warehouse_id: string;
        product_id: string;
        quantity: number;
      } = job.data;

      const idempotency_key = `${order_id}:${item_id}`;

      await this.inventoryService.addStock({
        warehouse_id,
        product_id,
        quantity,
        idempotency_key,
      });
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    const { order_id, item_id } = job.data;
    const idempotency_key = `${order_id}:${item_id}`;

    // BullMQ fires 'failed' after EVERY attempt, not just the last one —
    // only act once retries are actually exhausted
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      console.warn(
        `Job ${job.id} failed attempt ${job.attemptsMade}/${maxAttempts}, will retry: ${error.message}`,
      );
      return;
    }

    const movement = await this.inventoryService.didItemMove(idempotency_key);
    if (movement) {
      console.warn(
        `Job reported failed but stock WAS applied (key: ${idempotency_key}) — no action needed`,
      );
      return;
    }

    console.error(
      `Job ${job.id} failed permanently after ${job.attemptsMade} attempts:`,
      job.data,
      error.message,
    );

    await this.ordersClient.emit('inboundItemStockFailed', {
      order_id,
      item_id,
      reason: error.message,
      attempts: job.attemptsMade,
    });
  }
}
