import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOutboundOrderDetails } from "@/hooks/use-outbound-orders";
import { toast } from "@/hooks/use-toast";
import type { OutboundOrder } from "@/types/orders/outbound";
import { LuUser, LuCopy, LuCheck, LuCreditCard } from "react-icons/lu";
import { GoAlertFill } from "react-icons/go";

const statusVariant: Record<string, string> = {
  reserving: "receiving",
  reserved: "pending",
  confirmed: "received",
  shipped: "received",
  cancelling: "pending",
  cancelled: "cancelled",
  needs_attention: "needs_attention",
};

interface Props {
  order?: OutboundOrder | null;
  onClose: () => void;
}

export function OutboundOrderDetails({ order, onClose }: Props) {
  const { data, isLoading } = useOutboundOrderDetails(order?.id);
  const [paymentLink, setPaymentLink] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePaymentLink = () => {
    const link = `${window.location.origin}/pay/${order!.id}`;
    setPaymentLink(link);
    toast({ title: "Payment link generated" });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) return null;

  return (
    <div className="space-y-4 py-2">
      {/* Main Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Customer</p>
          <p className="font-medium">{order.customer_name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge variant={statusVariant[order.status] as any}>
            {order.status.replace("_", " ")}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Warehouse</p>
          <p className="text-sm">
            {isLoading ? "Loading..." : (data?.warehouse_name ?? "—")}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-medium">
            ${Number(order.total_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Products</p>
          <p className="text-sm">{order.total_products}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p className="text-sm">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      {/* Users */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">People</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Created by</p>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : data?.created_by_user ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <LuUser className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{data.created_by_user.name}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {data.created_by_user.role}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
          {data?.confirmed_by_user && (
            <div>
              <p className="text-xs text-muted-foreground">Confirmed by</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <LuUser className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{data.confirmed_by_user.name}</span>
              </div>
            </div>
          )}
          {data?.cancelled_by_user && (
            <div>
              <p className="text-xs text-muted-foreground">Cancelled by</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <LuUser className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm">{data.cancelled_by_user.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {data?.payment && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium mb-2">Payment</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                variant={
                  data.payment.status === "confirmed"
                    ? "received"
                    : data.payment.status === "failed"
                      ? "needs_attention"
                      : "pending"
                }
              >
                {data.payment.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Method</p>
              <p className="text-sm capitalize">
                {data.payment.payment_method || "card"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-sm font-medium">
                ${Number(data.payment.total_amount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm">
                {new Date(data.payment.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Failures */}
      {data?.failures && data.failures.length > 0 && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <GoAlertFill className="h-5 w-5 text-destructive" />
            <p className="font-medium text-destructive">
              Order Needs Attention
            </p>
          </div>
          <div className="space-y-2">
            {data.failures.map((f) => (
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
        </div>
      )}
      {/* Items */}
      <div>
        <p className="text-sm font-medium mb-2">Items</p>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))
        ) : (
          <div className="space-y-2">
            {data?.outbound_items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-3 bg-white"
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
                </div>
                <div className="text-right">
                  <p className="text-sm">Qty: {item.quantity}</p>
                  <p className="text-sm text-muted-foreground">
                    ${Number(item.unit_cost).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Payment Section */}
      {order.status === "reserved" && !data?.payment && (
        <div className="border-t pt-4">
          {!paymentLink ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Payment Required</p>
                <p className="text-xs text-muted-foreground">
                  Generate a payment link to send to the customer.
                </p>
              </div>
              <Button size="sm" onClick={generatePaymentLink}>
                <LuCreditCard className="mr-1.5 h-4 w-4" />
                Generate Link
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-2">Payment Link</p>
              <p className="text-xs text-muted-foreground mb-2">
                Share this link with the customer to complete payment.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm break-all">
                  {paymentLink}
                </code>
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  {copied ? (
                    <LuCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <LuCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}{" "}
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
