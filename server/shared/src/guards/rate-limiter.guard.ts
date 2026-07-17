/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";
import {
  RATE_LIMIT_KEY,
  RateLimitOptions,
} from "../decorators/rate-limit.decorator";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);
  private readonly limiters = new Map<string, RateLimiterRedis>();
  private readonly redis: Redis;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.configService.get("REDIS_HOST", "127.0.0.1"),
      port: this.configService.get("REDIS_PORT", 6379),
      password: this.configService.get("REDIS_PASSWORD"),
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const controller = context.getClass();

    const methodDecoratorConfig = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      handler,
    );
    const controllerDecoratorConfig = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      controller,
    );

    if (!methodDecoratorConfig && !controllerDecoratorConfig) {
      return true;
    }

    const config = this.mergeRateLimitConfigs(
      controllerDecoratorConfig,
      methodDecoratorConfig,
    );

    const method = request.method.toUpperCase() as HttpMethod;

    const methodConfig = config.methods?.[method] || {
      points: config.points,
      duration: config.duration,
      message: config.message,
    };

    const { points = 10, duration = 60, message } = methodConfig;

    const limiterKey = `${request.route?.path || "global"}_${method}`;
    let limiter = this.limiters.get(limiterKey);

    if (!limiter) {
      limiter = new RateLimiterRedis({
        storeClient: this.redis,
        keyPrefix: limiterKey,
        points,
        duration,
        blockDuration: 0,
        execEvenly: false,
      });
      this.limiters.set(limiterKey, limiter);
    }

    try {
      const result = await limiter.consume(request.ip ?? "unknown");

      response.setHeader("X-RateLimit-Limit", limiter.points);
      response.setHeader("X-RateLimit-Remaining", result.remainingPoints);
      response.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + result.msBeforeNext).toISOString(),
      );

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error("Rate limiter Redis error:", error.message);
        return true;
      }

      const rateLimitError = error as {
        remainingPoints?: number;
        msBeforeNext?: number;
      };

      const retryAfterSeconds = Math.ceil(
        (rateLimitError.msBeforeNext ?? 1000) / 1000,
      );

      response.setHeader("Retry-After", retryAfterSeconds.toString());
      response.setHeader("X-RateLimit-Limit", limiter.points);
      response.setHeader(
        "X-RateLimit-Remaining",
        rateLimitError.remainingPoints ?? 0,
      );
      response.setHeader(
        "X-RateLimit-Reset",
        new Date(Date.now() + (rateLimitError.msBeforeNext ?? 0)).toISOString(),
      );

      throw new HttpException(
        {
          statusCode: 429,
          message:
            message || `Too many ${method} requests. Please try again later.`,
          error: "Too Many Requests",
          data: { route: request.url },
        },
        429,
      );
    }
  }

  /**
   * Merges rate limit configs with proper inheritance:
   * controller defaults → method overrides
   */
  private mergeRateLimitConfigs(
    controllerConfig?: RateLimitOptions,
    methodConfig?: RateLimitOptions,
  ): RateLimitOptions {
    // Start with defaults
    const merged: RateLimitOptions = {
      points: 100,
      duration: 60,
    };

    // Layer 1: Controller config
    if (controllerConfig) {
      if (controllerConfig.points !== undefined)
        merged.points = controllerConfig.points;
      if (controllerConfig.duration !== undefined)
        merged.duration = controllerConfig.duration;
      if (controllerConfig.message !== undefined)
        merged.message = controllerConfig.message;
      if (controllerConfig.methods) {
        merged.methods = {};
        for (const [method, opts] of Object.entries(controllerConfig.methods)) {
          merged.methods[method as HttpMethod] = {
            points: opts.points ?? merged.points,
            duration: opts.duration ?? merged.duration,
            message: opts.message ?? merged.message,
          };
        }
      }
    }

    // Layer 2: Method config (overrides controller)
    if (methodConfig) {
      if (methodConfig.points !== undefined)
        merged.points = methodConfig.points;
      if (methodConfig.duration !== undefined)
        merged.duration = methodConfig.duration;
      if (methodConfig.message !== undefined)
        merged.message = methodConfig.message;

      if (methodConfig.methods) {
        merged.methods = merged.methods || {};
        for (const [method, opts] of Object.entries(methodConfig.methods)) {
          merged.methods[method as HttpMethod] = {
            points:
              opts.points ??
              merged.methods[method as HttpMethod]?.points ??
              merged.points,
            duration:
              opts.duration ??
              merged.methods[method as HttpMethod]?.duration ??
              merged.duration,
            message:
              opts.message ??
              merged.methods[method as HttpMethod]?.message ??
              merged.message,
          };
        }
      }
    }

    return merged;
  }
}
