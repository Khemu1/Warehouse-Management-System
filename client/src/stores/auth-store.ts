import type { Roles } from "@/types/users";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Roles;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (user: User) => {
        set({ user, isAuthenticated: true, isAdmin: user.role === "admin" });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },

      setUser: (user: Partial<User>) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...user };
        set({ user: updated, isAdmin: updated.role === "admin" });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }), // Only persist the user object
    },
  ),
);
