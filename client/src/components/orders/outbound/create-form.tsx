import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOutboundOrder } from "@/hooks/use-outbound-orders";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useProducts } from "@/hooks/use-products";
import { WarehouseCombobox } from "@/components/inventory/warehouse/WarehouseCombobox";
import { LuPlus, LuTrash2 } from "react-icons/lu";

interface Props {
  onClose: () => void;
}

export function CreateOutboundOrderForm({ onClose }: Props) {
  const [customer, setCustomer] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [items, setItems] = useState([
    { product_id: "", quantity: 1, unit_cost: 0 },
  ]);

  const { data: warehousesData } = useWarehouses(1, 100);
  const { data: productsData } = useProducts(1, 100);
  const warehouses = warehousesData?.items ?? [];
  const products = productsData?.items ?? [];

  const createOrder = useCreateOutboundOrder();

  const addItem = () =>
    setItems([...items, { product_id: "", quantity: 1, unit_cost: 0 }]);
  const removeItem = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    createOrder.mutate(
      { warehouse_id: warehouseId, customer_name: customer, items },
      { onSuccess: onClose },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Customer Name</label>
        <Input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
          placeholder="Acme Co."
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
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-2 rounded-md border p-3 bg-white"
          >
            <select
              className="h-9 rounded-md border px-3 text-sm bg-background w-full"
              value={item.product_id}
              onChange={(e) => updateItem(i, "product_id", e.target.value)}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
              <Input
                type="number"
                min={1}
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, "quantity", parseInt(e.target.value) || 0)
                }
                className="w-full min-w-[60px]"
                required
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Cost"
                value={item.unit_cost || ""}
                onChange={(e) =>
                  updateItem(i, "unit_cost", parseFloat(e.target.value) || 0)
                }
                className="w-full min-w-[80px]"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                className="shrink-0"
              >
                <LuTrash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}{" "}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createOrder.isPending || !warehouseId || !customer}
        >
          {createOrder.isPending ? "Creating..." : "Create Order"}
        </Button>
      </div>
    </form>
  );
}
