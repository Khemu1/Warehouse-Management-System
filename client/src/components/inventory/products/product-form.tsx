import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import type { Product } from "@/types/inventory/products";
import { type ProductFormData, productSchema } from "@/validations/product";
import { getFieldError } from "@/utils/form-errors";

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
  isLoading: boolean;
  onClose: () => void;
  serverErrors?: Record<string, string>;
}

export function ProductForm({
  product,
  onSave,
  isLoading,
  onClose,
  serverErrors,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      unit_price: product?.unit_price ?? 0,
      low_stock_threshold: product?.low_stock_threshold ?? 5,
    },
  });

  const onSubmit: SubmitHandler<ProductFormData> = (data) => {
    onSave(product ? { ...data, id: product.id } : data);
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
        label="SKU"
        error={getFieldError("sku", errors, serverErrors)}
        required
      >
        <Input {...register("sku")} />
      </FormField>

      <FormField
        label="Description"
        error={getFieldError("description", errors, serverErrors)}
      >
        <Input {...register("description")} />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Unit Price"
          error={getFieldError("unit_price", errors, serverErrors)}
          required
        >
          <Input
            type="number"
            step="0.01"
            {...register("unit_price", { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Low Stock Threshold"
          error={getFieldError("low_stock_threshold", errors, serverErrors)}
          required
        >
          <Input
            type="number"
            {...register("low_stock_threshold", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
