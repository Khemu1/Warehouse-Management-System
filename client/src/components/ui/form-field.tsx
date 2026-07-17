import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  error?: string;
  children?: React.ReactNode;
  required?: boolean;
}

export function FormField({
  label,
  error,
  children,
  required,
}: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <Label>
        {label}
        {required && (
          <span className="text-destructive ml-0.5 font-semibold">*</span>
        )}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive font-semibold">{error}</p>
      )}
    </div>
  );
}
