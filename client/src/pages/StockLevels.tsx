import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/data-table/pagination";
import { LuSearch } from "react-icons/lu";
import { useStockLevels } from "@/hooks/use-stock-levels";
import { useWarehouses } from "@/hooks/use-warehouses";
import { StockTable } from "@/components/inventory/stock/stock-table";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";

export default function StockLevels() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const { data: warehousesData } = useWarehouses(1, 100);
  const warehouses = warehousesData?.items ?? [];

  const { data, isLoading } = useStockLevels(page, 10, search, warehouseId);

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Stock Levels</h2>
        <p className="text-sm text-muted-foreground">
          Current inventory quantities across all warehouses.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white"
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
            Inventory Items ({meta?.totalItems ?? 0})
          </CardTitle>
        </CardHeader>
        <StockTable items={items} isLoading={isLoading} />
        {meta && (
          <Pagination
            page={meta.currentPage}
            totalPages={meta.totalPages}
            total={meta.totalItems}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
