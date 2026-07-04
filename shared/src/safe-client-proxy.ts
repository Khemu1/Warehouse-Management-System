// shared/src/safe-client-proxy.ts
import { RequestTimeoutException } from "@nestjs/common";
import { firstValueFrom, throwError } from "rxjs";
import { timeout, catchError } from "rxjs/operators";
import type { IRawClient, ISafeClient } from "./types";

export class SafeClientProxy implements ISafeClient {
  constructor(
    private readonly client: IRawClient,
    private readonly defaultTimeout = 5000,
  ) {}

  send<T = any>(
    pattern: string,
    data: any,
    ms = this.defaultTimeout,
  ): Promise<T> {
    return firstValueFrom(
      this.client.send<T>(pattern, data).pipe(
        timeout(ms),
        catchError((err) => {
          if (err.name === "TimeoutError") {
            return throwError(
              () => new RequestTimeoutException(`${pattern} timed out`),
            );
          }
          return throwError(() => err);
        }),
      ),
    );
  }

  emit<T = any>(pattern: string, data: any) {
    return this.client.emit<T>(pattern, data);
  }
}
