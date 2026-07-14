import { useState, type SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types/inventory/products";

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
  isLoading: boolean;
  onClose: () => void;
}

export function ProductForm({
  product,
  onSave,
  isLoading,
  onClose,
}: ProductFormProps) {
  const [form, setForm] = useState({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    unit_price: product?.unit_price ?? 0,
    low_stock_threshold: product?.low_stock_threshold ?? 5,
  });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    onSave(product ? { ...form, id: product.id } : form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-2">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">SKU</label>
        <Input
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Unit Price</label>
          <Input
            type="number"
            step="0.01"
            value={form.unit_price}
            onChange={(e) =>
              setForm({ ...form, unit_price: parseFloat(e.target.value) })
            }
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Low Stock Threshold</label>
          <Input
            type="number"
            value={form.low_stock_threshold}
            onChange={(e) =>
              setForm({
                ...form,
                low_stock_threshold: parseInt(e.target.value),
              })
            }
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : product ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
