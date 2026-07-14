import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/hooks/use-toast";

export const getAuthHeaders = (): Record<string, string> => {
  const store = useAuthStore.getState();
  const language = localStorage.getItem("language") || "ar";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": language,
    "x-platform": "web",
  };

  if (store?.user?.token) {
    headers.Authorization = `Bearer ${store?.user?.token}`;
  }

  return headers;
};

export const headersFiles = {
  Accept: "application/json",
  "Accept-Language": localStorage.getItem("language") || "ar",
};

export interface IAPIError {
  message: string;
  statusCode: number;
  status: string;
  safe: boolean;
  type: string;
  details?: string;
  errors?: Record<string, string>;
}

export interface IAPIError {
  message: string;
  statusCode: number;
  status: string;
  safe: boolean;
  type: string;
  details?: string;
  errors?: Record<string, string>;
}

export function isAPIError(error: unknown): error is IAPIError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "statusCode" in error &&
    "status" in error &&
    "type" in error
  );
}

async function handleErrorResponse(response: Response): Promise<never> {
  let parsedError: Partial<IAPIError> = {};

  try {
    parsedError = await response.json();
  } catch {
    // Response body wasn't JSON
  }

  // Rate limiting
  if (response.status === 429) {
    toast({
      variant: "destructive",
      title: "Too many requests",
      description: "Please try again in a few minutes.",
    });
  }

  // Auth errors
  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href =
      parsedError?.errors?.tokenVersionMissing === "true"
        ? "/login?expired=true"
        : "/login";
  }

  // Forbidden
  if (response.status === 403) {
    toast({
      variant: "destructive",
      title: "Access denied",
      description: "You don't have permission to perform this action.",
    });
  }

  // Server error
  if (response.status >= 500) {
    toast({
      variant: "destructive",
      title: "Server error",
      description: "Please try again later.",
    });
  }

  const errorObject: IAPIError = {
    message: parsedError.message || "An unexpected error occurred",
    statusCode: parsedError.statusCode || response.status,
    status: parsedError.status || "error",
    safe: parsedError.safe ?? false,
    type: parsedError.type || "unknown",
    details: parsedError.details,
    errors: parsedError.errors,
  };

  throw errorObject;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const store = useAuthStore.getState();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (store?.user?.token) {
    headers.Authorization = `Bearer ${store?.user?.token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
