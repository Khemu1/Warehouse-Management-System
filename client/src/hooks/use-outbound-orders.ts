import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { EnrichedOrder, OrdersResponse } from "@/types/orders/outbound";
import { apiFetch, isAPIError } from "@/services";

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
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/outbound-orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound-orders"] });
      toast({ title: "Outbound order created — reserving stock" });
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

export function useConfirmOutboundOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/outbound-orders/${id}/confirm`, { method: "PATCH" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outbound-orders"] });
      toast({ title: "Order confirmed — processing shipment" });
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
