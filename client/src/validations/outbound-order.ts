import { object, string, array, number, type infer as Infer } from "zod";

const outboundItemSchema = object({
  product_id: string().min(1, "Product is required"),
  quantity: number().min(1, "Quantity must be at least 1"),
  unit_cost: number().min(0, "Cost must be 0 or greater"),
});

export const outboundOrderSchema = object({
  warehouse_id: string().min(1, "Warehouse is required"),
  customer_name: string().min(1, "Customer name is required"),
  items: array(outboundItemSchema).min(1, "At least one item is required"),
});

export type OutboundOrderFormData = Infer<typeof outboundOrderSchema>;
