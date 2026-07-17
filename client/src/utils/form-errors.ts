/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldErrors } from "react-hook-form";

export function getFieldError<T extends Record<string, any>>(
  field: keyof T,
  clientErrors: FieldErrors<T>,
  serverErrors?: Record<string, string>,
): string | undefined {
  return (
    (clientErrors[field]?.message as string) || serverErrors?.[field as string]
  );
}
