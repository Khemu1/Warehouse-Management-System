import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { LuCreditCard } from "react-icons/lu";
import { apiFetch, isAPIError } from "@/services";

interface Props {
  onClose: () => void;
}

export function CreatePaymentDialog({ onClose }: Props) {
  const [orderId, setOrderId] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { order_id: string; payment_method: string }) =>
      apiFetch("/payments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "Payment processed successfully" });
      onClose();
    },
    onError: (error) => {
      if (isAPIError(error)) {
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message,
        });
      }
    },
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    mutation.mutate({ order_id: orderId, payment_method: "card" });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <p className="text-sm text-muted-foreground">
        Process a payment for a reserved outbound order.
      </p>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Order ID</label>
        <Input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter the outbound order ID"
          required
        />
      </div>

      <div className="rounded-md bg-muted p-4 text-center">
        <LuCreditCard className="mx-auto h-8 w-8 mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">Mock Payment</p>
        <p className="text-xs text-muted-foreground mt-1">
          Payment is mocked — it will be marked as confirmed automatically.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending || !orderId}>
          {mutation.isPending ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </form>
  );
}
