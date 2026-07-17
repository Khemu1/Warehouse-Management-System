import { Module, Global } from "@nestjs/common";
import Redis from "ioredis";

export const SSE_CHANNEL = "sse:events";
export const REDIS_PUB = "REDIS_PUB";
export const REDIS_SUB = "REDIS_SUB";
export const REDIS_CLIENT = "REDIS_CLIENT";

@Global()
@Module({
  providers: [
    {
      provide: REDIS_PUB,
      useFactory: () => new Redis({ host: "localhost", port: 6379 }),
    },
    {
      provide: REDIS_SUB,
      useFactory: () => new Redis({ host: "localhost", port: 6379 }),
    },
    {
      provide: REDIS_CLIENT,
      useFactory: () => new Redis({ host: "localhost", port: 6379 }),
    },
  ],
  exports: [REDIS_PUB, REDIS_SUB, REDIS_CLIENT],
})
export class RedisPubSubModule {}
