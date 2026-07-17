import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import type { Warehouse } from "@/types/inventory/warehouses";
import {
  type WarehouseFormData,
  warehouseSchema,
} from "@/validations/warehouse";
import { getFieldError } from "@/utils/form-errors";

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onSave: (warehouse: Partial<Warehouse>) => void;
  isLoading: boolean;
  onClose: () => void;
  serverErrors?: Record<string, string>;
}

export function WarehouseForm({
  warehouse,
  onSave,
  isLoading,
  onClose,
  serverErrors,
}: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name ?? "",
      location: warehouse?.location ?? "",
      capacity: warehouse?.capacity ?? 0,
    },
  });

  const onSubmit: SubmitHandler<WarehouseFormData> = (data) => {
    onSave(warehouse ? { ...data, id: warehouse.id } : data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <FormField
        label="Name"
        error={getFieldError("name", errors, serverErrors)}
        required
      >
        <Input {...register("name")} />
      </FormField>

      <FormField
        label="Location"
        error={getFieldError("location", errors, serverErrors)}
        required
      >
        <Input {...register("location")} />
      </FormField>

      <FormField
        label="Capacity"
        error={getFieldError("capacity", errors, serverErrors)}
        required
      >
        <Input
          type="number"
          min={1}
          {...register("capacity", { valueAsNumber: true })}
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : warehouse
              ? "Save Changes"
              : "Add Warehouse"}
        </Button>
      </div>
    </form>
  );
}
