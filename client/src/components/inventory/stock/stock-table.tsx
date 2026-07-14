import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { LuPackage } from "react-icons/lu";
import type { InventoryItem } from "@/types/inventory/stock";

interface StockTableProps {
  items: InventoryItem[];
  isLoading: boolean;
}

export function StockTable({ items, isLoading }: StockTableProps) {
  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Reserved</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (items.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Reserved</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-8 text-muted-foreground"
            >
              <LuPackage className="mx-auto h-8 w-8 mb-2 opacity-50" />
              No inventory items found.
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
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Warehouse</TableHead>
          <TableHead className="text-right">Available</TableHead>
          <TableHead className="text-right">Reserved</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const available = item.quantity - item.reserved_quantity;
          const isLow = available <= item.product.low_stock_threshold;

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.product.name}</TableCell>
              <TableCell className="sku-code text-sm">
                {item.product.sku}
              </TableCell>
              <TableCell>{item.warehouse.name}</TableCell>
              <TableCell className="text-right">{available}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {item.reserved_quantity}
              </TableCell>
              <TableCell className="text-right font-medium">
                {item.quantity}
              </TableCell>
              <TableCell>
                {isLow ? (
                  <Badge variant={"destructive"} className="hover:bg-danger/10">
                    Low Stock
                  </Badge>
                ) : (
                  <Badge>Healthy</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
