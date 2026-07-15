import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { EnrichedOrder, InboundOrder } from "@/types/orders/inbound";
import { apiFetch, isAPIError } from "@/services";

interface InboundOrdersResponse {
  items: InboundOrder[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
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
      apiFetch<InboundOrdersResponse>(
        `/inbound-orders?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&warehouse_id=${warehouseId}`,
      ),
  });
}

export function useCreateInboundOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiFetch("/inbound-orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbound-orders"] });
      toast({ title: "Inbound order created" });
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
      qc.invalidateQueries({ queryKey: ["stock-levels"] });
      toast({ title: "Order received — processing in background" });
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

export function useInboundOrderDetails(orderId: string | undefined) {
  return useQuery({
    queryKey: ["inbound-order", orderId],
    queryFn: () => apiFetch<EnrichedOrder>(`/inbound-orders/${orderId}`),
    enabled: !!orderId,
  });
}
