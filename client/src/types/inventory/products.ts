import type { Pagination } from "..";

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  unit_price: number; // Match the API response
  low_stock_threshold: number;
}


export interface ProductsResponse {
  items: Product[];
  meta: Pagination;
}
