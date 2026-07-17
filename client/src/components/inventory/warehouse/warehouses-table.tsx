import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
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
import { LuEllipsis, LuPencil, LuTrash2 } from "react-icons/lu";
import type { Warehouse } from "@/types/inventory/warehouses";

interface WarehousesTableProps {
  warehouses: Warehouse[];
  isLoading: boolean;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (id: string) => void;
}

export function WarehousesTable({
  warehouses,
  isLoading,
  onEdit,
  onDelete,
}: WarehousesTableProps) {
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const columns = isAdmin
    ? ["Name", "Location", "Capacity", ""]
    : ["Name", "Location", "Capacity"];

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: columns.length }).map((_, j) => (
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

  if (warehouses.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center py-8 text-muted-foreground"
            >
              No warehouses found.
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
          {columns.map((col, i) => (
            <TableHead key={i}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouses.map((warehouse) => (
          <TableRow key={warehouse.id}>
            <TableCell className="font-medium">{warehouse.name}</TableCell>
            <TableCell>{warehouse.location}</TableCell>
            <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
            {isAdmin && (
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <LuEllipsis className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(warehouse)}>
                      <LuPencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(warehouse.id)}
                    >
                      <LuTrash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
