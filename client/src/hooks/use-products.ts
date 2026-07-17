import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiFetch, isAPIError } from "@/services";
import type { ProductsResponse, Product } from "@/types/inventory/products";
import { useState } from "react";

// Fetch paginated products
export function useProducts(
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  return useQuery({
    queryKey: ["products", { page, limit, search }],
    queryFn: () =>
      apiFetch<ProductsResponse>(
        `/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      ),
  });
}

// Fetch single product
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => apiFetch<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Omit<Product, "id">) =>
      apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created successfully" });
      setApiError(null);
    },
    onError: (error) => {
      if (isAPIError(error)) {
        setApiError(error);
        // Only toast non-validation errors
        if (!error.errors) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
      }
    },
  });

  return { ...mutation, apiError };
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, ...data }: Product) =>
      apiFetch<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated successfully" });
      setApiError(null);
    },
    onError: (error) => {
      if (isAPIError(error)) {
        setApiError(error);
        if (!error.errors) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        }
      }
    },
  });

  return { ...mutation, apiError };
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted successfully" });
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
