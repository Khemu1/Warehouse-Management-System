import { Controller, Get, Inject } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
} from '@nestjs/terminus';
import type { ISafeClient } from '@shared/types';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
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
  @ApiOperation({ summary: 'Liveness check' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  checkLiveness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'All services healthy' })
  @ApiResponse({ status: 503, description: 'One or more services unhealthy' })
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
