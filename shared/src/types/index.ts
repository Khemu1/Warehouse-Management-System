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
  send<T = any>(pattern: string, data: any, ms?: number): Promise<T>;
}

export interface IRawClient {
  send<T = any>(pattern: any, data: any): Observable<T>;
  emit<T = any>(pattern: any, data: any): Observable<T>;
}

export enum InBoundOrderStatus {
  PENDING = "pending",
  RECEIVED = "received",
  CANCELLED = "cancelled",
}

export enum OUT_BoundOrderStatus {
  PENDING = "pending",
  RECEIVED = "received",
  CONFIRMED = "confirmed",
  SHIPPED = "shipped",
  CANCELLED = "cancelled",
}
