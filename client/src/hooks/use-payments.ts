import { useQuery } from "@tanstack/react-query";
import type { Payment } from "@/types/payments";
import { apiFetch } from "@/services";

interface PaymentsResponse {
  items: Payment[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export function usePayments(page = 1, limit = 10, status = "") {
  return useQuery({
    queryKey: ["payments", { page, limit, status }],
    queryFn: () =>
      apiFetch<PaymentsResponse>(
        `/payments?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
      ),
  });
}
