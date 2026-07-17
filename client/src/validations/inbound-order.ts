import { object, string, array, number, type infer as Infer } from "zod";

const inboundItemSchema = object({
  product_id: string().min(1, "Product is required"),
  expected_quantity: number().min(1, "Quantity must be at least 1"),
  unit_cost: number().min(0, "Cost must be 0 or greater"),
});

export const inboundOrderSchema = object({
  warehouse_id: string().min(1, "Warehouse is required"),
  supplier_name: string().min(1, "Supplier name is required"),
  items: array(inboundItemSchema).min(1, "At least one item is required"),
});

export type InboundOrderFormData = Infer<typeof inboundOrderSchema>;
