import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type {
  CreateOutboundOrder,
  EnrichedOrder,
  OutboundOrder,
} from "@/types/orders/outbound";
import { apiFetch, isAPIError } from "@/services";

interface OrdersResponse {
  items: OutboundOrder[];
  meta: { totalItems: number; totalPages: number; currentPage: number };
}

export function useOutboundOrders(
  page = 1,
  limit = 10,
  search = "",
  warehouseId = "",
) {
  return useQuery({
    queryKey: ["outbound-orders", { page, limit, search, warehouseId }],
    queryFn: () =>
      apiFetch<OrdersResponse>(
        `/outbound-orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&warehouse_id=${warehouseId}`,
      ),
  });
}

export function useOutboundOrderDetails(orderId: string | undefined) {
  return useQuery({
    queryKey: ["outbound-order", orderId],
    queryFn: () => apiFetch<EnrichedOrder>(`/outbound-orders/${orderId}`),
    enabled: !!orderId,
  });
}

export function useCreateOutboundOrder() {
  const qc = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateOutboundOrder) =>
      apiFetch("/outbound-orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound-orders"] });
      toast({ title: "Outbound order created — reserving stock" });
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

export function useConfirmOutboundOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/outbound-orders/${id}/confirm`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound-orders"] });
      toast({ title: "Order confirmed — processing" });
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

export function useCancelOutboundOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/outbound-orders/${id}/cancel`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound-orders"] });
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
export function useRetryOutboundOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/outbound-orders/${id}/retry`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound-orders"] });
      qc.invalidateQueries({ queryKey: ["outbound-order"] });
      toast({ title: "Retry queued — processing in background" });
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
