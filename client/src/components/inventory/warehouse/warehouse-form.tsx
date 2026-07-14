import { useState, type SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Warehouse } from "@/types/inventory/warehouses";

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onSave: (warehouse: Partial<Warehouse>) => void;
  isLoading: boolean;
  onClose: () => void;
}

export function WarehouseForm({
  warehouse,
  onSave,
  isLoading,
  onClose,
}: WarehouseFormProps) {
  const [form, setForm] = useState({
    name: warehouse?.name ?? "",
    location: warehouse?.location ?? "",
    capacity: warehouse?.capacity ?? 0,
  });

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    onSave(warehouse ? { ...form, id: warehouse.id } : form);
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
        <label className="text-sm font-medium">Location</label>
        <Input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Capacity</label>
        <Input
          type="number"
          min={0}
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: parseInt(e.target.value) })
          }
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : warehouse
              ? "Save Changes"
              : "Add Warehouse"}
        </Button>
      </div>
    </form>
  );
}
