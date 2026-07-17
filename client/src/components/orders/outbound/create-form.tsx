import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useCreateOutboundOrder } from "@/hooks/use-outbound-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";
import {
  type OutboundOrderFormData,
  outboundOrderSchema,
} from "@/validations/outbound-order";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { getFieldError } from "@/utils/form-errors";

interface Props {
  onClose: () => void;
}

export function CreateOutboundOrderForm({ onClose }: Props) {
  const { data: warehousesData } = useWarehouses(1, 100);
  const { data: productsData } = useProducts(1, 100);
  const warehouses = warehousesData?.items ?? [];
  const products = productsData?.items ?? [];
  const createOrder = useCreateOutboundOrder();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OutboundOrderFormData>({
    resolver: zodResolver(outboundOrderSchema),
    defaultValues: {
      warehouse_id: "",
      customer_name: "",
      items: [{ product_id: "", quantity: 1, unit_cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const onSubmit: SubmitHandler<OutboundOrderFormData> = (data) => {
    createOrder.mutate(data, { onSuccess: onClose });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <FormField
        label="Customer Name"
        error={getFieldError("customer_name", errors)}
        required
      >
        <Input {...register("customer_name")} />
      </FormField>

      <FormField
        label="Warehouse"
        error={getFieldError("warehouse_id", errors)}
        required
      >
        <WarehouseCombobox
          warehouses={warehouses}
          value={control._formValues.warehouse_id}
          onChange={(id) => setValue("warehouse_id", id)}
        />
        {errors.warehouse_id && (
          <p className="text-xs text-destructive mt-1">
            {errors.warehouse_id.message}
          </p>
        )}
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Items</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ product_id: "", quantity: 1, unit_cost: 0 })
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
            <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                className="w-full min-w-[60px]"
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Cost"
                {...register(`items.${i}.unit_cost`, { valueAsNumber: true })}
                className="w-full min-w-[80px]"
              />
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
