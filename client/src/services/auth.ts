import type { User } from "@/stores/auth-store";
import { apiFetch } from ".";

export const login = async (email: string, password: string): Promise<User> => {
  return apiFetch<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const logout = async (): Promise<boolean> => {
  await apiFetch("/auth/logout", { method: "DELETE" });
  return true;
};

export const fetchMyData = async (): Promise<User> => {
  return apiFetch<User>("/users/my-data");
};
