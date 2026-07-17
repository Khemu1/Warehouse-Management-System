import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LuPlus, LuSearch } from "react-icons/lu";
import { useDialogStore } from "@/stores/dialog-store";
import { Pagination } from "@/components/data-table/pagination";
import {
  useWarehouses,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeleteWarehouse,
} from "@/hooks/use-warehouses";
import { AppDialog } from "@/components/dialogs/app-dialog";
import { WarehouseForm } from "@/components/inventory/warehouse/warehouse-form";
import { WarehousesTable } from "@/components/inventory/warehouse/warehouses-table";
import type { Warehouse } from "@/types/inventory/warehouses";
import { useAuthStore } from "@/stores/auth-store";
import { Roles } from "@/types/users";

export default function Warehouses() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const dialog = useDialogStore();

  const { data, isLoading } = useWarehouses(page, 10, search);
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();
  const deleteWarehouse = useDeleteWarehouse();

  const warehouses = data?.items ?? [];
  const meta = data?.meta;

  const handleSave = (warehouse: Partial<Warehouse>) => {
    if (warehouse.id) {
      updateWarehouse.mutate(warehouse as Warehouse);
    } else {
      createWarehouse.mutate(warehouse as Omit<Warehouse, "id">);
    }
  };

  const handleDelete = (id: string) => {
    deleteWarehouse.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-sm text-muted-foreground">
            Manage your warehouse locations.
          </p>
        </div>
        {user?.role === Roles.ADMIN && (
          <Button onClick={() => dialog.open("warehouse-form")}>
            <LuPlus className="mr-1.5 h-4 w-4" />
            Add Warehouse
          </Button>
        )}
      </div>

      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9 bg-white"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All Warehouses ({meta?.totalItems ?? 0})
          </CardTitle>
        </CardHeader>
        <WarehousesTable
          warehouses={warehouses}
          isLoading={isLoading}
          onEdit={(warehouse) => dialog.open("warehouse-form", warehouse)}
          onDelete={handleDelete}
        />
        {meta && (
          <Pagination
            page={meta.currentPage}
            totalPages={meta.totalPages}
            total={meta.totalItems}
            onPageChange={setPage}
          />
        )}
      </Card>

      <AppDialog
        open={dialog.isOpen("warehouse-form")}
        onClose={() => dialog.close("warehouse-form")}
        title={
          dialog.getData<Warehouse>("warehouse-form")
            ? "Edit Warehouse"
            : "Add Warehouse"
        }
      >
        <WarehouseForm
          warehouse={dialog.getData<Warehouse>("warehouse-form")}
          onSave={handleSave}
          isLoading={createWarehouse.isPending || updateWarehouse.isPending}
          onClose={() => dialog.close("warehouse-form")}
          serverErrors={
            createWarehouse.apiError?.errors || updateWarehouse.apiError?.errors
          }
        />
      </AppDialog>
    </div>
  );
}
