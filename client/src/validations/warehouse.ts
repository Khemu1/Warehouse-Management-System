import { number, object, string, type infer as Infer } from "zod";

export const warehouseSchema = object({
  name: string().min(2, "Name must be at least 2 characters"),
  location: string().min(1, "Location is required"),
  capacity: number().min(1, "Capacity must be at least 1"),
});

export type WarehouseFormData = Infer<typeof warehouseSchema>;
