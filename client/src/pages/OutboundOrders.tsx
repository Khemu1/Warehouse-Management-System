import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/data-table/pagination";
import { AppDialog } from "@/components/dialogs/app-dialog";
import { useDialogStore } from "@/stores/dialog-store";
import {
  useOutboundOrders,
  useCancelOutboundOrder,
  useConfirmOutboundOrder,
  useRetryOutboundOrder,
} from "@/hooks/use-outbound-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";
import { OutboundOrdersTable } from "@/components/orders/outbound/outbound-orders-table";
import { CreateOutboundOrderForm } from "@/components/orders/outbound/create-form";
import { OutboundOrderDetails } from "@/components/orders/outbound/order-details";
import type { OutboundOrder } from "@/types/orders/outbound";
import { LuPlus, LuSearch } from "react-icons/lu";

export default function OutboundOrders() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const dialog = useDialogStore();

  const { data: warehousesData } = useWarehouses(1, 100);
  const warehouses = warehousesData?.items ?? [];

  const { data, isLoading } = useOutboundOrders(page, 10, search, warehouseId);
  const cancelOrder = useCancelOutboundOrder();
  const confirmOrder = useConfirmOutboundOrder();
  const retryOrder = useRetryOutboundOrder();

  const orders = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Outbound Orders</h2>
          <p className="text-sm text-muted-foreground">
            Ship stock to customers.
          </p>
        </div>
        <Button onClick={() => dialog.open("create-outbound")}>
          <LuPlus className="mr-1.5 h-4 w-4" /> New Outbound Order
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <WarehouseCombobox
          warehouses={warehouses}
          value={warehouseId}
          onChange={(id) => {
            setWarehouseId(id);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            All Outbound Orders ({meta?.totalItems ?? 0})
          </CardTitle>
        </CardHeader>
        <OutboundOrdersTable
          orders={orders}
          isLoading={isLoading}
          onView={(order) => dialog.open("view-outbound", order)}
          onConfirm={(order) => confirmOrder.mutate(order.id)}
          onRetry={(id) => retryOrder.mutate(id)}
          onCancel={(id) => cancelOrder.mutate(id)}
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
        open={dialog.isOpen("create-outbound")}
        onClose={() => dialog.close("create-outbound")}
        title="New Outbound Order"
        className="sm:max-w-[600px]"
      >
        <CreateOutboundOrderForm
          onClose={() => dialog.close("create-outbound")}
        />
      </AppDialog>

      <AppDialog
        open={dialog.isOpen("view-outbound")}
        onClose={() => dialog.close("view-outbound")}
        title="Order Details"
        className="sm:max-w-[600px]"
      >
        <OutboundOrderDetails
          order={dialog.getData<OutboundOrder>("view-outbound")}
          onClose={() => dialog.close("view-outbound")}
        />
      </AppDialog>
    </div>
  );
}
