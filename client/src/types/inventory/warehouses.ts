import type { Pagination } from "..";

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  manager_id?: string;
}
export interface WarehousesResponse {
  items: Warehouse[];
  meta: Pagination;
}
