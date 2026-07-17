import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, isAPIError } from "@/services";
import { toast } from "@/hooks/use-toast";
import type {
  CreateInboundOrder,
  EnrichedOrder,
  InboundOrder,
} from "@/types/orders/inbound";

interface OrdersResponse {
  items: InboundOrder[];
  meta: { totalItems: number; totalPages: number; currentPage: number };
}

export function useInboundOrders(
  page = 1,
  limit = 10,
  search = "",
  warehouseId = "",
) {
  return useQuery({
    queryKey: ["inbound-orders", { page, limit, search, warehouseId }],
    queryFn: () =>
      apiFetch<OrdersResponse>(
        `/inbound-orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&warehouse_id=${warehouseId}`,
      ),
  });
}

export function useInboundOrderDetails(orderId: string | undefined) {
  return useQuery({
    queryKey: ["inbound-order", orderId],
    queryFn: () => apiFetch<EnrichedOrder>(`/inbound-orders/${orderId}`),
    enabled: !!orderId,
  });
}

export function useCreateInboundOrder() {
  const qc = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateInboundOrder) =>
      apiFetch("/inbound-orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbound-orders"] });
      toast({ title: "Inbound order created" });
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

export function useReceiveInboundOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string;
      items: { item_id: string; received_quantity: number }[];
    }) =>
      apiFetch(`/inbound-orders/${id}/receive`, {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbound-orders"] });
      qc.invalidateQueries({ queryKey: ["inbound-order"] });
      toast({ title: "Order is being processed" });
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

export function useCancelInboundOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/inbound-orders/${id}/cancel`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbound-orders"] });
      toast({ title: "Order cancelled" });
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
