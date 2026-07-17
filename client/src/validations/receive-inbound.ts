import { object, string, array, number, type infer as Infer } from "zod";

const receiveItemSchema = object({
  item_id: string().min(1, "Item is required"),
  received_quantity: number().min(0, "Quantity must be 0 or greater"),
});

export const receiveInboundSchema = object({
  order_id: string().min(1, "Order is required"),
  items: array(receiveItemSchema).min(1, "At least one item is required"),
});

export type ReceiveInboundFormData = Infer<typeof receiveInboundSchema>;
