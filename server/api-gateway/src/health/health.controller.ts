/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import type { ISafeClient } from '@shared/types';
import { RabbitMQHealthIndicator } from './rabbitmq.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private rmq: RabbitMQHealthIndicator,
    @Inject('AUTH_SERVICE') private authClient: ISafeClient,
    @Inject('INVENTORY_SERVICE') private inventoryClient: ISafeClient,
    @Inject('PAYMENTS_SERVICE') private paymentClient: ISafeClient,
    @Inject('ORDERS_SERVICE') private ordersClient: ISafeClient,
  ) {}

  @Get('live')
  @HealthCheck()
  checkLiveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () =>
        this.rmq.pingService('auth-service', this.authClient, 'health.check'),
      () =>
        this.rmq.pingService(
          'inventory-service',
          this.inventoryClient,
          'health.check',
        ),
      () =>
        this.rmq.pingService(
          'payment-service',
          this.paymentClient,
          'health.check',
        ),
      () =>
        this.rmq.pingService(
          'orders-service',
          this.ordersClient,
          'health.check',
        ),
    ]);
  }
}
