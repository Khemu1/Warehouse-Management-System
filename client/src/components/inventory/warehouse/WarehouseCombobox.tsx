import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LuCheck, LuChevronsUpDown } from "react-icons/lu";
import { cn } from "@/lib/utils";

interface Warehouse {
  id: string;
  name: string;
}

interface WarehouseComboboxProps {
  warehouses: Warehouse[];
  value: string;
  onChange: (warehouseId: string) => void;
}

export function WarehouseCombobox({
  warehouses,
  value,
  onChange,
}: WarehouseComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = warehouses.find((w) => w.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between bg-white"
        >
          {selected ? selected.name : "All Warehouses"}
          <LuChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search warehouse..." className="h-9" />
          <CommandList>
            <CommandEmpty>No warehouse found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                All Warehouses
                <LuCheck
                  className={cn(
                    "ml-auto",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
              {warehouses.map((w) => (
                <CommandItem
                  key={w.id}
                  value={w.name}
                  onSelect={() => {
                    onChange(w.id);
                    setOpen(false);
                  }}
                >
                  {w.name}
                  <LuCheck
                    className={cn(
                      "ml-auto",
                      value === w.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
