import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "@/types/inventory/stock";
import { apiFetch } from "@/services";

interface StockResponse {
  items: InventoryItem[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export function useStockLevels(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  warehouseId: string = "",
) {
  return useQuery({
    queryKey: ["stock-levels", { page, limit, search, warehouseId }],
    queryFn: () =>
      apiFetch<StockResponse>(
        `/inventory?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&warehouse_id=${warehouseId}`,
      ),
  });
}
