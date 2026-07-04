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
