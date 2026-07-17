import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useCreateInboundOrder } from "@/hooks/use-inbound-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";
import {
  type InboundOrderFormData,
  inboundOrderSchema,
} from "@/validations/inbound-order";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { getFieldError } from "@/utils/form-errors";

interface Props {
  onClose: () => void;
}

export function CreateInboundOrderForm({ onClose }: Props) {
  const { data: warehousesData } = useWarehouses(1, 100);
  const { data: productsData } = useProducts(1, 100);
  const warehouses = warehousesData?.items ?? [];
  const products = productsData?.items ?? [];
  const createOrder = useCreateInboundOrder();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InboundOrderFormData>({
    resolver: zodResolver(inboundOrderSchema),
    defaultValues: {
      warehouse_id: "",
      supplier_name: "",
      items: [{ product_id: "", expected_quantity: 1, unit_cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit: SubmitHandler<InboundOrderFormData> = (data) => {
    createOrder.mutate(data, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <FormField
        label="Supplier Name"
        error={getFieldError(
          "supplier_name",
          errors,
          createOrder.apiError?.errors,
        )}
        required
      >
        <Input {...register("supplier_name")} />
      </FormField>

      <FormField
        label="Warehouse"
        error={getFieldError(
          "warehouse_id",
          errors,
          createOrder.apiError?.errors,
        )}
        required
      >
        <WarehouseCombobox
          warehouses={warehouses}
          value={control._formValues.warehouse_id}
          onChange={(id) => setValue("warehouse_id", id)}
        />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Items</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ product_id: "", expected_quantity: 1, unit_cost: 0 })
            }
          >
            <LuPlus className="mr-1 h-3 w-3" /> Add Item
          </Button>
        </div>
        {fields.map((field, i) => (
          <div
            key={field.id}
            className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-2 rounded-md border p-3"
          >
            <FormField
              label=""
              error={getFieldError(
                `items.${i}.product_id` as any,
                errors,
                createOrder.apiError?.errors,
              )}
            >
              <select
                className="h-9 rounded-md border px-3 text-sm bg-background w-full"
                {...register(`items.${i}.product_id`)}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </FormField>
            <div className="grid grid-cols-[1fr,auto] gap-2 items-center">
              <FormField
                label=""
                error={getFieldError(
                  `items.${i}.expected_quantity` as any,
                  errors,
                  createOrder.apiError?.errors,
                )}
              >
                <Input
                  type="number"
                  min={1}
                  placeholder="Qty"
                  {...register(`items.${i}.expected_quantity`, {
                    valueAsNumber: true,
                  })}
                  className="w-full min-w-[60px]"
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
                disabled={fields.length === 1}
              >
                <LuTrash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {errors.items && (
          <p className="text-xs text-destructive">{errors.items.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createOrder.isPending}>
          {createOrder.isPending ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
