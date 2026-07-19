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
import {
  LuEllipsis,
  LuPackageCheck,
  LuEye,
  LuTruck,
  LuRefreshCw,
} from "react-icons/lu";
import type { InboundOrder } from "@/types/orders/inbound";
import { IoCloseCircleSharp } from "react-icons/io5";

interface Props {
  orders: InboundOrder[];
  isLoading: boolean;
  onView: (order: InboundOrder) => void;
  onReceive: (order: InboundOrder) => void;
  onRetry: (order_id: string) => void;
  onCancel: (id: string) => void;
}

export function InboundOrdersTable({
  orders,
  isLoading,
  onView,
  onReceive,
  onRetry,
  onCancel,
}: Props) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Items</TableHead>
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
            <TableHead>Supplier</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-8 text-muted-foreground"
            >
              <LuTruck className="mx-auto h-8 w-8 mb-2 opacity-50" />
              No inbound orders found.
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
          <TableHead>Supplier</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.supplier_name}</TableCell>
            <TableCell>{order.item_count ?? 0} items</TableCell>
            <TableCell>
              <Badge variant={order.status as any}>
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
                  {order.status === "needs_attention" && (
                    <DropdownMenuItem onClick={() => onRetry(order.id)}>
                      <LuRefreshCw className="mr-2 h-4 w-4" /> Retry
                    </DropdownMenuItem>
                  )}
                  {order.status === "pending" && (
                    <>
                      <DropdownMenuItem onClick={() => onReceive(order)}>
                        <LuPackageCheck className="mr-2 h-4 w-4" /> Receive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onCancel(order.id)}
                      >
                        <IoCloseCircleSharp className="mr-2 h-4 w-4" /> Cancel
                      </DropdownMenuItem>
                    </>
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
