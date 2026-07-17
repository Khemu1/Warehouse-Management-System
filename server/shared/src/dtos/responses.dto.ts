export class PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export class ApiErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  errors?: Record<string, string>;
}

export class LoginResponse {
  access_token: string;
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

// Products
export class ProductResponse {
  id: string;
  name: string;
  sku: string;
  description: string;
  unit_price: number;
  low_stock_threshold: number;
}

export class PaginatedProductsResponse {
  items: ProductResponse[];
  meta: PaginationMeta;
}

// Warehouses
export class WarehouseResponse {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export class PaginatedWarehousesResponse {
  items: WarehouseResponse[];
  meta: PaginationMeta;
}

// Inventory
export class InventoryProductBrief {
  id: string;
  name: string;
  sku: string;
  low_stock_threshold: number;
}

export class InventoryWarehouseBrief {
  id: string;
  name: string;
}

export class InventoryItemResponse {
  id: string;
  quantity: number;
  reserved_quantity: number;
  product: InventoryProductBrief;
  warehouse: InventoryWarehouseBrief;
}

export class PaginatedInventoryResponse {
  items: InventoryItemResponse[];
  meta: PaginationMeta;
}

// Inbound Orders
export class InboundItemResponse {
  id: string;
  product_id: string;
  expected_quantity: number;
  received_quantity: number;
  unit_cost: number;
  product?: ProductResponse;
}

export class InboundOrderResponse {
  id: string;
  supplier_name: string;
  status: string;
  total_amount: number;
  item_count?: number;
  warehouse_name?: string;
  created_at: string;
  inbound_items?: InboundItemResponse[];
}

export class PaginatedInboundOrdersResponse {
  items: InboundOrderResponse[];
  meta: PaginationMeta;
}

// Outbound Orders
export class UserBrief {
  id: string;
  name: string;
  role: string;
}

export class PaymentBrief {
  id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
}

export class OutboundItemResponse {
  id: string;
  quantity: number;
  unit_cost: number;
  product?: ProductResponse;
}

export class OutboundOrderResponse {
  id: string;
  customer_name: string;
  status: string;
  total_amount: number;
  total_products: number;
  item_count?: number;
  warehouse_name?: string;
  created_at: string;
  created_by_user?: UserBrief;
  confirmed_by_user?: UserBrief;
  cancelled_by_user?: UserBrief;
  payment?: PaymentBrief;
  outbound_items?: OutboundItemResponse[];
}

export class PaginatedOutboundOrdersResponse {
  items: OutboundOrderResponse[];
  meta: PaginationMeta;
}

// Payments
export class PaymentResponse {
  id: string;
  order_id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
}

export class PaginatedPaymentsResponse {
  items: PaymentResponse[];
  meta: PaginationMeta;
}

// Dashboard
export class DashboardStatsResponse {
  totalProducts: number;
  lowStockCount: number;
  totalStockQuantity: number;
  pendingInbound: number;
  pendingOutbound: number;
  shippedToday: number;
  revenueToday: number;
}

// Users
export class UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export class PaginatedUsersResponse {
  items: UserResponse[];
  meta: PaginationMeta;
}
