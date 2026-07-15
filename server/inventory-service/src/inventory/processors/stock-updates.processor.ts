// inventory-service: stock-updates.processor.ts
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { InventoryService } from '../inventory.service';
import type { ISafeClient } from '@shared/types';

interface StockJobData {
  order_id: string;
  item_id: string;
  warehouse_id: string;
  product_id: string;
  quantity: number;
}

@Processor('stock-updates')
export class StockUpdatesProcessor extends WorkerHost {
  constructor(
    private inventoryService: InventoryService,
    @Inject('ORDERS_SERVICE') private ordersClient: ISafeClient,
  ) {
    super();
  }

  async process(job: Job<StockJobData>) {
    const { order_id, item_id, warehouse_id, product_id, quantity } = job.data;
    const idempotency_key = `${order_id}:${item_id}:${job.name}`;

    switch (job.name) {
      case 'add_stock':
        return this.handleAddStock({
          warehouse_id,
          product_id,
          quantity,
          idempotency_key,
        });

      case 'reserve_stock':
        return this.handleReserveStock({
          warehouse_id,
          product_id,
          quantity,
          idempotency_key,
        });

      case 'fulfill_stock':
        return this.handleFulfillStock({
          warehouse_id,
          product_id,
          quantity,
          idempotency_key,
        });

      case 'cancel_stock':
        return this.handleCancelStock({
          warehouse_id,
          product_id,
          quantity,
          idempotency_key,
        });

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleAddStock(params: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    // Add stock logic with idempotency
    return this.inventoryService.addStock(params);
  }

  private async handleReserveStock(params: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    // Reserve stock logic - preserves existing stock
    return this.inventoryService.reserveItem(params);
  }

  private async handleFulfillStock(params: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    // Payment confirmed: deduct real stock AND release the reservation
    return this.inventoryService.fulfillItem(params);
  }

  private async handleCancelStock(params: {
    warehouse_id: string;
    product_id: string;
    quantity: number;
    idempotency_key: string;
  }) {
    return this.inventoryService.releaseReservation(params);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<StockJobData>) {
    const { order_id, item_id } = job.data;

    switch (job.name) {
      case 'add_stock':
        await this.ordersClient.emit('inboundItemStockAdded', {
          order_id,
          item_id,
        });
        break;

      case 'reserve_stock':
        await this.ordersClient.emit('outboundItemStockReserved', {
          order_id,
          item_id,
        });
        break;
      case 'fulfill_stock':
        await this.ordersClient.emit('outboundItemStockFulfilled', {
          order_id,
          item_id,
        });
        break;
      case 'cancel_stock':
        await this.ordersClient.emit('outboundItemStockReleased', {
          order_id,
          item_id,
        });
        break;

      default:
        // add_stock and any other job types have no completion event today
        break;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<StockJobData>, error: Error) {
    const { order_id, item_id } = job.data;
    const idempotency_key = `${order_id}:${item_id}:${job.name}`;

    // Check if retries are exhausted
    const maxAttempts = job.opts.attempts ?? 1;
    if (job.attemptsMade < maxAttempts) {
      console.warn(
        `Job ${job.id} (${job.name}) failed attempt ${job.attemptsMade}/${maxAttempts}, will retry: ${error.message}`,
      );
      return;
    }

    // Check if the operation actually succeeded despite job failure
    const movement = await this.inventoryService.didItemMove(idempotency_key);
    if (movement) {
      console.warn(
        `Job reported failed but stock WAS applied (key: ${idempotency_key}) — no action needed`,
      );

      if (job.name === 'reserve_stock') {
        // await this.ordersClient.emit('outboundItemStockReserved', {
        //   order_id,
        //   item_id,
        // });
      }
      if (job.name === 'fulfill_stock') {
        // await this.ordersClient.emit('outboundItemStockFulfilled', {
        //   order_id,
        //   item_id,
        // });
      }
      if (job.name === 'cancel_stock') {
        // await this.ordersClient.emit('outboundItemStockReleased', {
        //   order_id,
        //   item_id,
        // });
      }
      return;
    }

    // Handle permanent failures based on job type
    console.error(
      `Job ${job.id} (${job.name}) failed permanently after ${job.attemptsMade} attempts:`,
      job.data,
      error.message,
    );

    await this.handlePermanentFailure(job, error);
  }

  private async handlePermanentFailure(job: Job<StockJobData>, error: Error) {
    const { order_id, item_id } = job.data;

    switch (job.name) {
      case 'reserve_stock':
        await this.ordersClient.emit('outboundItemStockFailed', {
          order_id,
          item_id,
          reason: error.message,
          attempts: job.attemptsMade,
        });
        break;

      case 'add_stock':
        await this.ordersClient.emit('inboundItemStockFailed', {
          order_id,
          item_id,
          reason: error.message,
          attempts: job.attemptsMade,
        });
        break;

      case 'fulfill_stock':
        await this.ordersClient.emit('outboundItemFulfillmentFailed', {
          order_id,
          item_id,
          reason: error.message,
          attempts: job.attemptsMade,
        });
        break;

      case 'cancel_stock':
        // A failed release is serious: reserved_quantity may stay stuck,
        // blocking that stock from ever being reserved again. Surface it
        // loudly rather than letting it go silent.
        await this.ordersClient.emit('outboundItemReleaseFailed', {
          order_id,
          item_id,
          reason: error.message,
          attempts: job.attemptsMade,
        });
        break;

      default:
        console.error(`Unknown job type for failure handling: ${job.name}`);
    }
  }
}
