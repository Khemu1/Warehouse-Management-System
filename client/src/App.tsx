import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Warehouses from "./pages/Warehouses";
import StockLevels from "./pages/StockLevels";
import InboundOrders from "./pages/InboundOrders";
// import Warehouses from "@/pages/Warehouses";
// import StockLevels from "@/pages/StockLevels";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory/products" element={<Products />} />
          <Route path="/inventory/warehouses" element={<Warehouses />} />
          <Route path="/inventory/stock" element={<StockLevels />} />
          <Route path="/orders/inbound" element={<InboundOrders />} />
          <Route path="/orders/outbound" element={<div>Outbound Orders</div>} />
          <Route path="/payments" element={<div>Payments</div>} />
          <Route path="/settings" element={<div>Settings</div>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
