import type { Pagination } from ".";

export enum Roles {
  ADMIN = "admin",
  STAFF = "staff",
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: Roles;
}
export interface UsersResponse {
  items: User[];
  meta: Pagination;
}

export interface NewUser extends Omit<User, "id"> {
  password?: string;
}

export interface EditUser extends Omit<NewUser, "role"> {
  id: string;
  role?: Roles;
  password?: string;
}
