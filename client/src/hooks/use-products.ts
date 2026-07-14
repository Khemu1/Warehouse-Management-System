import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { apiFetch, isAPIError } from "@/services";
import type { ProductsResponse, Product } from "@/types/inventory/products";

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

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Product, "id">) =>
      apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created successfully" });
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

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Product) =>
      apiFetch<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated successfully" });
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
