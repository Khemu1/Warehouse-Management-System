import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiFetch, isAPIError } from "@/services";
import type { Warehouse } from "@/types/inventory/warehouses";

interface WarehousesResponse {
  items: Warehouse[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export function useWarehouses(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  return useQuery({
    queryKey: ["warehouses", { page, limit, search }],
    queryFn: () =>
      apiFetch<WarehousesResponse>(
        `/warehouses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      ),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Warehouse, "id">) =>
      apiFetch<Warehouse>("/warehouses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({ title: "Warehouse created successfully" });
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    },
  });
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Warehouse) =>
      apiFetch<Warehouse>(`/warehouses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({ title: "Warehouse updated successfully" });
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    },
  });
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/warehouses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast({ title: "Warehouse deleted successfully" });
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    },
  });
}
