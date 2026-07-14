import { useAuthStore } from "@/stores/auth-store";

let navigateFn: ((path: string) => void) | null = null;

export const setGlobalNavigate = (navigate: (path: string) => void) => {
  navigateFn = navigate;
};

export const navigateTo = (path: string) => {
  if (navigateFn) {
    navigateFn(path);
  } else {
    console.warn("Navigate function not yet available");
  }
};

export const navigateToAuth = (clearStore?: true) => {
  if (clearStore) {
    useAuthStore.getState().logout();
  }

  window.location.href = `${import.meta.env.VITE_SITE_URL}/auth${clearStore ? "?logout=true" : ""}`;
};

export const navigateToUnauthorized = () => navigateTo("/unauthorized");
