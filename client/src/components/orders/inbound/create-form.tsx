import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateInboundOrder } from "@/hooks/use-inbound-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";

interface Props {
  onClose: () => void;
}

export function CreateInboundOrderForm({ onClose }: Props) {
  const [supplier, setSupplier] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([
    { product_id: "", expected_quantity: 1, unit_cost: 0 },
  ]);

  const { data: warehousesData } = useWarehouses(1, 100);
  const { data: productsData } = useProducts(1, 100);
  const warehouses = warehousesData?.items ?? [];
  const products = productsData?.items ?? [];

  const createOrder = useCreateInboundOrder();

  const addItem = () =>
    setItems([
      ...items,
      { product_id: "", expected_quantity: 1, unit_cost: 0 },
    ]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    createOrder.mutate(
      { warehouse_id: warehouseId, supplier_name: supplier, items },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Supplier Name</label>
        <Input
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Warehouse</label>
        <WarehouseCombobox
          warehouses={warehouses}
          value={warehouseId}
          onChange={setWarehouseId}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Items</label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <LuPlus className="mr-1 h-3 w-3" /> Add Item
          </Button>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <select
              className="flex-1 h-9 rounded-md border px-3 text-sm"
              value={item.product_id}
              onChange={(e) => {
                const updated = [...items];
                updated[i].product_id = e.target.value;
                setItems(updated);
              }}
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            <Input
              type="number"
              min={1}
              value={item.expected_quantity}
              onChange={(e) => {
                const updated = [...items];
                updated[i].expected_quantity = parseInt(e.target.value);
                setItems(updated);
              }}
              className="w-20"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
            >
              <LuTrash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createOrder.isPending || !warehouseId}>
          {createOrder.isPending ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
