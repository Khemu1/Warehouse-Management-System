import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LuPlus, LuSearch } from "react-icons/lu";
import { useDialogStore } from "@/stores/dialog-store";
import { Pagination } from "@/components/data-table/pagination";
import { ProductsTable } from "@/components/inventory/products/products-table";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import type { Product } from "@/types/inventory/products";
import { ProductForm } from "@/components/inventory/products/product-form";
import { AppDialog } from "@/components/dialogs/app-dialog";

export default function Products() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const dialog = useDialogStore();

  const { data, isLoading } = useProducts(page, 10, search);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const products = data?.items ?? [];
  const meta = data?.meta;

  const handleSave = (product: Partial<Product>) => {
    if (product.id) {
      updateProduct.mutate(product as Product, {
        onSuccess: () => dialog.close("product-form"),
      });
    } else {
      createProduct.mutate(product as Omit<Product, "id">);
    }
  };

  const handleDelete = (id: string) => {
    deleteProduct.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog.
          </p>
        </div>
        <Button onClick={() => dialog.open("product-form")}>
          <LuPlus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="relative">
        <LuSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
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
            All Products ({meta?.totalItems ?? 0})
          </CardTitle>
        </CardHeader>
        <ProductsTable
          products={products}
          isLoading={isLoading}
          onEdit={(product) => dialog.open("product-form", product)}
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

      {/* Product Form Dialog */}
      <AppDialog
        open={dialog.isOpen("product-form")}
        onClose={() => dialog.close("product-form")}
        title={
          dialog.getData<Product>("product-form")
            ? "Edit Product"
            : "Add Product"
        }
      >
        <ProductForm
          product={dialog.getData<Product>("product-form")}
          onSave={handleSave}
          isLoading={createProduct.isPending || updateProduct.isPending}
          onClose={() => dialog.close("product-form")}
        />
      </AppDialog>
    </div>
  );
}
