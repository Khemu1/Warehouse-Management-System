import { Observable } from "rxjs";

export enum Roles {
  ADMIN = "admin",
  STAFF = "staff",
}

export interface JwtPayload {
  user_id: string;
  role: Roles;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}

export interface ISafeClient {
  /**
   * Request-response pattern — sends a message and awaits the reply.
   * Already resolves to a Promise (SafeClientProxy handles the Observable
   * conversion internally), so callers should just `await` it directly —
   * never wrap this in firstValueFrom().
   */
  send<T = any>(pattern: string, data: any, ms?: number): Promise<T>;

  /**
   * Fire-and-forget event — no reply expected, nothing to await meaningfully.
   * Matches ClientProxy.emit()'s signature; kept synchronous/void since the
   * caller isn't meant to depend on completion.
   */
  emit<T = any>(pattern: string, data: any): Promise<T>;
}

export interface IRawClient {
  send<T = any>(pattern: any, data: any): Observable<T>;
  emit<T = any>(pattern: any, data: any): Observable<T>;
}

export enum InBoundOrderStatus {
  PENDING = "pending",
  RECEIVED = "received",
  RECEIVING = "receiving",
  PARTIALLY_RECEIVED = "partially_received",
  CANCELLED = "cancelled",
  NEEDS_ATTENTION = "needs_attention",
}

export enum OUT_BoundOrderStatus {
  PENDING = "pending",
  RECEIVED = "received",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  CANCELLED = "cancelled",
  NEEDS_ATTENTION = "needs_attention",
}
