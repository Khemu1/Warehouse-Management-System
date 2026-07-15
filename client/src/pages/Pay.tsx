import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import {
  LuBox,
  LuCreditCard,
  LuTruck,
  LuSmartphone,
  LuShieldCheck,
} from "react-icons/lu";
import { useState } from "react";
import { apiFetch } from "@/services";
import { useOutboundOrderDetails } from "@/hooks/use-outbound-orders";
import { Label } from "@/components/ui/label";

interface ExistingPayment {
  id: string;
  order_id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
}

const paymentMethods = [
  {
    value: "visa",
    label: "Visa",
    icon: LuCreditCard,
    description: "Pay with Visa credit/debit card",
  },
  {
    value: "mastercard",
    label: "Mastercard",
    icon: LuCreditCard,
    description: "Pay with Mastercard credit/debit card",
  },
  {
    value: "fawry",
    label: "Fawry",
    icon: LuSmartphone,
    description: "Pay via Fawry — Egypt's national payment system",
  },
];

export default function Pay() {
  const { orderId } = useParams();
  const [paid, setPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("visa");

  const { data: order, isLoading: orderLoading } =
    useOutboundOrderDetails(orderId);

  // Check if payment already exists
  const { data: existingPayment, isLoading: paymentLoading } = useQuery({
    queryKey: ["payment-for-order", orderId],
    queryFn: () => apiFetch<ExistingPayment>(`/payments/order/${orderId}`),
    enabled: !!orderId,
    retry: false,
  });

  const paymentMutation = useMutation({
    mutationFn: () =>
      apiFetch("/payments", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          payment_method: paymentMethod,
        }),
      }),
    onSuccess: () => {
      setPaid(true);
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed.",
      });
    },
  });

  const isLoading = orderLoading || paymentLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already paid
  if (paid || existingPayment) {
    const payment = existingPayment;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
              <LuShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold">
              Payment {payment ? "Already" : ""} Confirmed
            </h2>
            {payment ? (
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold">
                  This order has already been paid.
                </p>
                <div className="rounded-md bg-muted p-3 mt-3 text-left space-y-1">
                  <div className="flex justify-between">
                    <span>Amount</span>
                    <span className="font-medium text-foreground">
                      ${Number(payment.total_amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method</span>
                    <span className="font-medium text-foreground capitalize">
                      {payment.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="received">{payment.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-medium text-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Your payment of ${Number(order?.total_amount).toFixed(2)} has
                been processed.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order not found
  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <LuBox className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-bold">Order Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">
              This link is invalid or the order no longer exists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <LuCreditCard className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Complete Your Payment</CardTitle>
          <CardDescription>
            Order from{" "}
            <span className="font-medium">{order.customer_name}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-md bg-muted p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Warehouse</span>
              <div className="flex items-center gap-1.5">
                <LuTruck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {order.warehouse_name}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {order?.outbound_items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">
                      {item.product?.name ?? "Product"}
                    </span>
                    {item.product?.sku && (
                      <span className="text-xs text-muted-foreground">
                        {item.product.sku}
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="text-muted-foreground">
                      x{item.quantity}
                    </span>
                    <span className="ml-3">
                      ${(Number(item.unit_cost) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3 flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">
                ${Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="pending">Awaiting Payment</Badge>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm font-medium mb-3">Payment Method</p>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid gap-2"
            >
              {paymentMethods.map((method) => (
                <div key={method.value}>
                  <RadioGroupItem
                    value={method.value}
                    id={method.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.value}
                    className="flex items-center gap-3 rounded-md border p-3 cursor-pointer peer-aria-checked:border-primary peer-aria-checked:bg-primary/5 hover:bg-muted/50 transition-colors"
                  >
                    <method.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => paymentMutation.mutate()}
            disabled={paymentMutation.isPending}
          >
            <LuCreditCard className="mr-2 h-5 w-5" />
            {paymentMutation.isPending
              ? "Processing..."
              : `Pay $${Number(order.total_amount).toFixed(2)} via ${paymentMethods.find((m) => m.value === paymentMethod)?.label}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This is a mock payment. No real charges will be made.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
