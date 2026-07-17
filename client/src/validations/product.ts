import { object, string, number, type infer as Infer } from "zod";

export const productSchema = object({
  name: string().min(3, "Name must be at least 3 characters"),
  sku: string().min(1, "SKU is required"),
  description: string().optional(),
  unit_price: number().min(0, "Price must be 0 or greater"),
  low_stock_threshold: number().min(0, "Threshold must be 0 or greater"),
});

export type ProductFormData = Infer<typeof productSchema>;
