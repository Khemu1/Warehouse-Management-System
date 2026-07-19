import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiFetch, isAPIError } from "@/services";
import { useOutboundOrderDetails } from "@/hooks/use-outbound-orders";
import {
  LuBox,
  LuCreditCard,
  LuTruck,
  LuSmartphone,
  LuShieldCheck,
  LuLoader,
} from "react-icons/lu";
import { GoAlert } from "react-icons/go";

import { useState } from "react";

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
  const queryClient = useQueryClient();

  const { data: order, isLoading: orderLoading } =
    useOutboundOrderDetails(orderId);

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
      queryClient.invalidateQueries({
        queryKey: ["payment-for-order", orderId],
      });
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed.",
      });
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: error.message,
        });
      }
    },
  });

  const retryMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/payments/${existingPayment?.id}/retry`, { method: "POST" }),
    onSuccess: () => {
      setPaid(true);
      queryClient.invalidateQueries({
        queryKey: ["payment-for-order", orderId],
      });
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed.",
      });
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Retry Failed",
          description: error.message,
        });
      }
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

  // Existing payment screen
  if (existingPayment) {
    const payment = existingPayment;
    const isConfirmed = payment.status === "confirmed";
    const isFailed = payment.status === "failed";

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div
              className={`
              mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4
              ${isConfirmed ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-amber-100"}
            `}
            >
              {isConfirmed ? (
                <LuShieldCheck className="h-7 w-7 text-green-600" />
              ) : isFailed ? (
                <GoAlert className="h-7 w-7 text-red-600" />
              ) : (
                <LuLoader className="h-7 w-7 text-amber-600 animate-spin" />
              )}
            </div>

            <h2 className="text-lg font-bold">
              {isConfirmed
                ? "Payment Confirmed"
                : isFailed
                  ? "Payment Failed"
                  : "Payment Pending"}
            </h2>

            <div className="rounded-md bg-muted p-3 mt-4 text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${Number(payment.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Method</span>
                <span className="font-medium capitalize">
                  {payment.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    isConfirmed
                      ? "received"
                      : isFailed
                        ? "needs_attention"
                        : "pending"
                  }
                >
                  {payment.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-medium">
                  {new Date(payment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {!isConfirmed && (
              <Button
                className="mt-4 w-full"
                onClick={() => retryMutation.mutate()}
                disabled={retryMutation.isPending}
              >
                <LuCreditCard className="mr-2 h-5 w-5" />
                {retryMutation.isPending ? "Processing..." : "Retry Payment"}
              </Button>
            )}

            {isFailed && (
              <p className="text-xs text-muted-foreground mt-2">
                Your payment was declined. Please try again or use a different
                method.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already paid (just completed)
  if (paid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
              <LuShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <h2 className="text-lg font-bold">Payment Confirmed</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your payment of ${Number(order?.total_amount).toFixed(2)} has been
              processed.
            </p>
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

  // New payment form
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
