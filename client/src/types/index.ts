export interface Pagination {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  totalStockQuantity: number;
  pendingInbound: number;
  pendingOutbound: number;
  shippedToday: number;
  revenueToday: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  supplier_name: string;
  type: "inbound" | "outbound";
  status: string;
  total_amount: number;
  created_at: string;
}
