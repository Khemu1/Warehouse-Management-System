import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/protected-route";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Warehouses from "./pages/Warehouses";
import StockLevels from "./pages/StockLevels";
import InboundOrders from "./pages/InboundOrders";
import OutboundOrders from "./pages/OutboundOrders";
import Payments from "./pages/Payments";
import Pay from "./pages/Pay";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
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
          <Route path="/users" element={<Users />} />{" "}
          <Route path="/inventory/products" element={<Products />} />
          <Route path="/inventory/warehouses" element={<Warehouses />} />
          <Route path="/inventory/stock" element={<StockLevels />} />
          <Route path="/orders/inbound" element={<InboundOrders />} />
          <Route path="/orders/outbound" element={<OutboundOrders />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="/pay/:orderId" element={<Pay />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
