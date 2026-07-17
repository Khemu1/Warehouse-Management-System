import type { Pagination } from "..";

export interface CreateInboundOrder {
  warehouse_id: string;
  supplier_name: string;
  items: { product_id: string; expected_quantity: number; unit_cost: number }[];
}

export interface InboundOrderItem {
  id: string;
  product_id: string;
  expected_quantity: number;
  received_quantity: number;
  unit_cost: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface InboundOrder {
  id: string;
  warehouse_id: string;
  supplier_name: string;
  status:
    | "pending"
    | "receiving"
    | "received"
    | "cancelled"
    | "needs_attention";
  created_by: string;
  created_at: string;
  item_count: number;
}

export interface InboundOrdersResponse {
  items: InboundOrder[];
  meta: Pagination;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unit_price: number;
}

interface EnrichedItem extends InboundOrderItem {
  product?: Product;
}

export interface EnrichedOrder extends InboundOrder {
  warehouse_name?: string;
  failures?: Failure[];
  inbound_items?: EnrichedItem[];
}

interface Failure {
  id: string;
  item_id: string | null;
  reason: string;
  attempts: number;
  created_at: string;
}
