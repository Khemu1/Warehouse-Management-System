import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import type { EditUser, NewUser, User, UsersResponse } from "@/types/users";
import { apiFetch, isAPIError } from "@/services";

export function useUsers(page = 1, limit = 10, search = "") {
  return useQuery({
    queryKey: ["users", { page, limit, search }],
    queryFn: () =>
      apiFetch<UsersResponse>(
        `/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      ),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: NewUser) =>
      apiFetch<User>("/users", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User created" });
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

export function useUpdateUser() {
  const qc = useQueryClient();
  const [apiError, setApiError] = useState<{
    message: string;
    errors?: Record<string, string>;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: ({ id, ...data }: EditUser) =>
      apiFetch<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated" });
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
