export interface InventoryItem {
  id: string;
  quantity: number;
  reserved_quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    low_stock_threshold: number;
  };
  warehouse: {
    id: string;
    name: string;
  };
}
export interface StockResponse {
  items: InventoryItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
