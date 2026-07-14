import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import type { ISafeClient } from '@shared/types';

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

@Injectable()
export class RabbitMQHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async pingService(
    key: string,
    client: ISafeClient,
    pattern: string,
    timeoutMs?: number,
  ): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await client.send(pattern, {}, timeoutMs);
      return indicator.up();
    } catch (err: unknown) {
      return indicator.down({ message: getErrorMessage(err) });
    }
  }
}
