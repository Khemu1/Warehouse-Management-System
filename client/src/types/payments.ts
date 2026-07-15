import type { Pagination } from ".";

export interface Payment {
  id: string;
  order_id: string;
  status: "pending" | "confirmed" | "failed";
  payment_method: string;
  total_amount: number;
  created_at: string;
}
export interface PaymentsResponse {
  items: Payment[];
  meta: Pagination;
}
