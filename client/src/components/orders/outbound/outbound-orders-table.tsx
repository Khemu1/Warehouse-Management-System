import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { LuEllipsis, LuCheck, LuEye, LuTruck } from "react-icons/lu";
import { GoXCircle } from "react-icons/go";

import type { OutboundOrder } from "@/types/orders/outbound";

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
  orders: OutboundOrder[];
  isLoading: boolean;
  onView: (order: OutboundOrder) => void;
  onConfirm: (order: OutboundOrder) => void;
  onCancel: (id: string) => void;
}

export function OutboundOrdersTable({
  orders,
  isLoading,
  onView,
  onConfirm,
  onCancel,
}: Props) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (orders.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={6}
              className="text-center py-8 text-muted-foreground"
            >
              <LuTruck className="mx-auto h-8 w-8 mb-2 opacity-50" />
              No outbound orders found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.customer_name}</TableCell>
            <TableCell>
              {order.item_count ?? order.outbound_items?.length ?? 0}
            </TableCell>
            <TableCell className="text-right">
              ${Number(order.total_amount).toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[order.status] as any}>
                {order.status.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <LuEllipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(order)}>
                    <LuEye className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  {order.status === "reserved" && (
                    <DropdownMenuItem onClick={() => onConfirm(order)}>
                      <LuCheck className="mr-2 h-4 w-4" /> Confirm
                    </DropdownMenuItem>
                  )}
                  {(order.status === "reserved" ||
                    order.status === "reserving") && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onCancel(order.id)}
                    >
                      <GoXCircle className="mr-2 h-4 w-4" /> Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
