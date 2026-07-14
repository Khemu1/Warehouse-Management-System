import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login, logout, fetchMyData } from "@/services/auth";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { isAPIError } from "@/services";

export const useLoginUser = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const user = await login(credentials.email, credentials.password);
      // Token is inside the user object
      setAuth({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: user.token,
      });
      return user;
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome back",
        description: `Signed in as ${data.name}`,
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      }
    },
  });

  return mutation;
};

export const useLogoutUser = () => {
  const navigate = useNavigate();
  const { logout: clearAuth } = useAuthStore();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
      clearAuth();
      navigate("/login");
    },
    onError: () => {
      // Force logout even if server call fails
      clearAuth();
      navigate("/login");
    },
  });

  return mutation;
};

export const useFetchMyData = () => {
  const { user, setUser } = useAuthStore();

  return useQuery({
    queryKey: ["my-data", user?.id],
    queryFn: async () => {
      const response = await fetchMyData();
      setUser(response);
      return response;
    },
    enabled: !!user?.token && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCheckAuth = () => {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      // After hydration, if user exists, mark as authenticated
      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.setState({
          isAuthenticated: true,
          isAdmin: user.role === "admin",
        });
      }
      setAuthChecked(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      const user = useAuthStore.getState().user;
      if (user) {
        useAuthStore.setState({
          isAuthenticated: true,
          isAdmin: user.role === "admin",
        });
      }
      queueMicrotask(() => setAuthChecked(true));
    }

    return () => unsub();
  }, []);

  return authChecked;
};
