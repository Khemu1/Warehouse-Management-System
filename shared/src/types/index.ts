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
