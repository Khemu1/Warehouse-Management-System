import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { InboundOrder } from "@/types/orders/inbound";
import { useInboundOrderDetails } from "@/hooks/use-inbound-orders";
import { GoAlertFill } from "react-icons/go";

interface Props {
  order?: InboundOrder | null;
  onClose: () => void;
}

export function InboundOrderDetails({ order, onClose }: Props) {
  const { data, isLoading } = useInboundOrderDetails(order?.id);

  if (!order) return null;

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Supplier</p>
          <p className="font-medium">{order.supplier_name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge variant={order.status as any}>
            {order.status
              .replace("_", " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>{" "}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Warehouse</p>
          <p className="text-sm">
            {isLoading ? "Loading..." : (data?.warehouse_name ?? "—")}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="text-sm">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Failures Section */}
      {data?.failures && data.failures.length > 0 && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <GoAlertFill className="h-5 w-5 text-destructive" />
            <p className="font-medium text-destructive">
              Stock Receiving Failed
            </p>
          </div>
          <div className="space-y-2">
            {data.failures.map((f: any) => (
              <div
                key={f.id}
                className="flex items-start justify-between rounded border border-destructive/10 bg-background p-3"
              >
                <div className="flex-1">
                  <p className="text-sm">{f.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(f.created_at).toLocaleString()} · {f.attempts}{" "}
                    attempt{f.attempts > 1 ? "s" : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-destructive/30 text-destructive text-xs ml-2 shrink-0"
                >
                  Failed
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Receiving failed after multiple attempts. Check the inventory and
            retry.
          </p>
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-2">Items</p>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))
        ) : (
          <div className="space-y-2">
            {data?.inbound_items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border bg-white p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.product?.name ?? item.product_id}
                  </p>
                  {item.product?.sku && (
                    <p className="text-xs text-muted-foreground">
                      {item.product.sku}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Expected: {item.expected_quantity} | Received:{" "}
                    {item.received_quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  ${Number(item.unit_cost).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
