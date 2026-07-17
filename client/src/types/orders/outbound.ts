import type { Pagination } from "..";
import type { Payment } from "../payments";

export interface CreateOutboundOrder {
  warehouse_id: string;
  customer_name: string;
  items: { product_id: string; quantity: number; unit_cost: number }[];
}

export interface OutboundOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  product?: {
    id: string;
    name: string;
    sku: string;
    unit_price: number;
  };
}
interface User {
  id: string;
  name: string;
  role: string;
}

export interface EnrichedOrder extends OutboundOrder {
  warehouse_name?: string;
  created_by_user?: User | null;
  confirmed_by_user?: User | null;
  cancelled_by_user?: User | null;
  failures?: {
    id: string;
    item_id: string | null;
    reason: string;
    attempts: number;
    created_at: string;
  }[];
  outbound_items?: (OutboundOrderItem & {
    product?: {
      id: string;
      name: string;
      sku: string;
      unit_price: number;
    } | null;
  })[];
  payment?: Payment;
}

export interface OutboundOrder {
  id: string;
  warehouse_id: string;
  customer_name: string;
  status:
    | "reserving"
    | "reserved"
    | "confirmed"
    | "confirming"
    | "shipped"
    | "cancelling"
    | "cancelled"
    | "needs_attention";
  total_amount: number;
  total_products: number;
  item_count?: number;
  created_at: string;
  outbound_items?: OutboundOrderItem[];
}

export interface OrdersResponse {
  items: OutboundOrder[];
  meta: Pagination;
}
