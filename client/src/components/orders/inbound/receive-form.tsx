import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/ui/form-field";
import { getFieldError } from "@/utils/form-errors";
import {
  useReceiveInboundOrder,
  useInboundOrderDetails,
} from "@/hooks/use-inbound-orders";
import {
  type ReceiveInboundFormData,
  receiveInboundSchema,
} from "@/validations/receive-inbound";
import type { InboundOrder } from "@/types/orders/inbound";

interface Props {
  order: InboundOrder | null;
  onClose: () => void;
}

export function ReceiveInboundOrderForm({ order, onClose }: Props) {
  const receiveOrder = useReceiveInboundOrder();
  const { data: fullOrder, isLoading } = useInboundOrderDetails(order?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReceiveInboundFormData>({
    resolver: zodResolver(receiveInboundSchema),
    values: {
      order_id: order?.id ?? "",
      items:
        fullOrder?.inbound_items?.map((item) => ({
          item_id: item.id,
          received_quantity: item.expected_quantity,
        })) ?? [],
    },
  });

  const onSubmit: SubmitHandler<ReceiveInboundFormData> = (data) => {
    receiveOrder.mutate(
      { id: order!.id, items: data.items },
      { onSuccess: onClose },
    );
  };

  if (!order) return null;

  const items = fullOrder?.inbound_items ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Supplier:</span>{" "}
          <span className="font-medium">{order.supplier_name}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Warehouse:</span>{" "}
          <span className="font-medium">
            {isLoading ? "..." : (fullOrder?.warehouse_name ?? "—")}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Confirm received quantities.
      </p>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {item.product?.name ?? item.product_id}
                </p>
                {item.product?.sku && (
                  <p className="text-xs text-muted-foreground">
                    {item.product.sku}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Expected:{" "}
                  <span className="font-medium">{item.expected_quantity}</span>
                </span>
                <FormField
                  label=""
                  error={getFieldError(
                    `items.${i}.received_quantity` as any,
                    errors,
                    receiveOrder.apiError?.errors,
                  )}
                >
                  <Input
                    type="number"
                    min={0}
                    {...register(`items.${i}.received_quantity`, {
                      valueAsNumber: true,
                    })}
                    className="w-20 h-8 text-sm"
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      )}
      {errors.items && (
        <p className="text-xs text-destructive">{errors.items.message}</p>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={receiveOrder.isPending || isLoading}>
          {receiveOrder.isPending ? "Processing..." : "Confirm Receipt"}
        </Button>
      </div>
    </form>
  );
}
