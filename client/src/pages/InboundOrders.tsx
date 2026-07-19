import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/data-table/pagination";
import { AppDialog } from "@/components/dialogs/app-dialog";
import { useDialogStore } from "@/stores/dialog-store";
import {
  useInboundOrders,
  useCancelInboundOrder,
  useRetryInboundOrder,
} from "@/hooks/use-inbound-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { InboundOrdersTable } from "@/components/orders/inbound/inbound-orders-table";
import { CreateInboundOrderForm } from "@/components/orders/inbound/create-form";
import { ReceiveInboundOrderForm } from "@/components/orders/inbound/receive-form";
import type { InboundOrder } from "@/types/orders/inbound";
import { LuPlus, LuSearch } from "react-icons/lu";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";
import { InboundOrderDetails } from "@/components/orders/inbound/order-details";

export default function InboundOrders() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const dialog = useDialogStore();

  const { data: warehousesData } = useWarehouses(1, 100);
  const warehouses = warehousesData?.items ?? [];

  const { data, isLoading } = useInboundOrders(page, 10, search, warehouseId);
  const cancelOrder = useCancelInboundOrder();
  const retryOrder = useRetryInboundOrder();

  const orders = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Inbound Orders</h2>
          <p className="text-sm text-muted-foreground">
            Receive stock into warehouses.
          </p>
        </div>
        <Button onClick={() => dialog.open("create-inbound")}>
          <LuPlus className="mr-1.5 h-4 w-4" /> New Inbound Order
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by supplier..."
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
            All Inbound Orders ({meta?.totalItems ?? 0})
          </CardTitle>
        </CardHeader>
        <InboundOrdersTable
          orders={orders}
          isLoading={isLoading}
          onView={(order) => dialog.open("view-inbound", order)}
          onReceive={(order) => dialog.open("receive-inbound", order)}
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
        open={dialog.isOpen("create-inbound")}
        onClose={() => dialog.close("create-inbound")}
        title="New Inbound Order"
      >
        <CreateInboundOrderForm
          onClose={() => dialog.close("create-inbound")}
        />
      </AppDialog>

      <AppDialog
        open={dialog.isOpen("receive-inbound")}
        onClose={() => dialog.close("receive-inbound")}
        title="Receive Order"
      >
        <ReceiveInboundOrderForm
          order={dialog.getData<InboundOrder>("receive-inbound")}
          onClose={() => dialog.close("receive-inbound")}
        />
      </AppDialog>

      <AppDialog
        open={dialog.isOpen("view-inbound")}
        onClose={() => dialog.close("view-inbound")}
        title="Order Details"
        className="sm:max-w-[600px]"
      >
        <InboundOrderDetails
          order={dialog.getData<InboundOrder>("view-inbound")}
          onClose={() => dialog.close("view-inbound")}
        />
      </AppDialog>
    </div>
  );
}
