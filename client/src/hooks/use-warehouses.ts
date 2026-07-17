import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type {
  Warehouse,
  WarehousesResponse,
} from "@/types/inventory/warehouses";
import { apiFetch, isAPIError } from "@/services";

export function useWarehouses(page = 1, limit = 10, search = "") {
  return useQuery({
    queryKey: ["warehouses", { page, limit, search }],
    queryFn: () =>
      apiFetch<WarehousesResponse>(
        `/warehouses?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      ),
  });
}

export function useCreateWarehouse() {
  const qc = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Omit<Warehouse, "id">) =>
      apiFetch<Warehouse>("/warehouses", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      toast({ title: "Warehouse created" });
      setApiError(null);
    },
    onError: (error) => {
      if (isAPIError(error)) {
        setApiError(error);
        if (!error.errors)
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
      }
    },
  });

  return { ...mutation, apiError };
}

export function useUpdateWarehouse() {
  const qc = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, ...data }: Warehouse) =>
      apiFetch<Warehouse>(`/warehouses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      toast({ title: "Warehouse updated" });
      setApiError(null);
    },
    onError: (error) => {
      if (isAPIError(error)) {
        setApiError(error);
        if (!error.errors)
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
      }
    },
  });

  return { ...mutation, apiError };
}

export function useDeleteWarehouse() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/warehouses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["warehouses"] });
      toast({ title: "Warehouse deleted" });
    },
    onError: (error) => {
      if (isAPIError(error))
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
    },
  });
}
