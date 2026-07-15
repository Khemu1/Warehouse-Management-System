import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReceiveInboundOrder,
  useInboundOrderDetails,
} from "@/hooks/use-inbound-orders";
import type { InboundOrder } from "@/types/orders/inbound";

interface Props {
  order: InboundOrder | null;
  onClose: () => void;
}

export function ReceiveInboundOrderForm({ order, onClose }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const receiveOrder = useReceiveInboundOrder();
  const { data: fullOrder, isLoading } = useInboundOrderDetails(order?.id);

  if (!order) return null;

  const items = fullOrder?.inbound_items ?? [];

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const receiveItems = items.map((item) => ({
      item_id: item.id,
      received_quantity: quantities[item.id] ?? item.expected_quantity,
    }));
    receiveOrder.mutate(
      { id: order.id, items: receiveItems },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      {/* Order Summary */}
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
        Confirm received quantities. Defaults to expected quantity.
      </p>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
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
                <Input
                  type="number"
                  min={0}
                  defaultValue={item.expected_quantity}
                  onChange={(e) =>
                    setQuantities({
                      ...quantities,
                      [item.id]: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-20 h-8 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
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
