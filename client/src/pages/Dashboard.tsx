import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { apiFetch } from "@/services";
import {
  LuPackage,
  LuClipboardCheck,
  LuTruck,
  LuDollarSign,
  LuArrowUpRight,
  LuTriangleAlert,
} from "react-icons/lu";
import { FiArrowDownCircle, FiArrowUpCircle } from "react-icons/fi";

import { Link } from "react-router-dom";
import type { DashboardStats, RecentOrder } from "@/types";

const statusVariant: Record<string, string> = {
  pending: "pending",
  reserving: "receiving",
  reserved: "pending",
  confirmed: "received",
  receiving: "receiving",
  received: "received",
  shipped: "received",
  cancelled: "cancelled",
  needs_attention: "needs_attention",
};

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/dashboard/stats"),
    refetchInterval: 30000,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: () => apiFetch<RecentOrder[]>("/dashboard/recent-orders"),
    refetchInterval: 30000,
  });

const stats = [
  {
    label: "Total Products",
    value: data?.totalProducts ?? 0,
    icon: LuPackage,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Low Stock Alerts",
    value: data?.lowStockCount ?? 0,
    icon: LuTriangleAlert,
    color: "text-red-700",
    bg: "bg-red-50",
    highlight: !!data?.lowStockCount,
  },
  {
    label: "Pending Inbound",
    value: data?.pendingInbound ?? 0,
    icon: LuClipboardCheck,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    label: "Pending Outbound",
    value: data?.pendingOutbound ?? 0,
    icon: LuTruck,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  {
    label: "Shipped Today",
    value: data?.shippedToday ?? 0,
    icon: LuTruck,
    color: "text-teal-700",
    bg: "bg-teal-50",
  },
  {
    label: "Revenue Today",
    value: `$${(data?.revenueToday ?? 0).toLocaleString()}`,
    icon: LuDollarSign,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
];

const quickLinks = [
  {
    label: "View Inventory",
    path: "/inventory/stock",
    icon: LuPackage,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Inbound Orders",
    path: "/orders/inbound",
    icon: FiArrowDownCircle,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    label: "Outbound Orders",
    path: "/orders/outbound",
    icon: FiArrowUpCircle,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  {
    label: "Payments",
    path: "/payments",
    icon: LuDollarSign,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-sm text-muted-foreground font-semibold">
            Here's what's happening in your warehouse today.
          </p>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {data?.lowStockCount ? (
        <Alert className="border-red-300 bg-red-50">
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{data.lowStockCount} products</strong> are running low on
              stock and need attention.
            </span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-red-600 underline"
              asChild
            >
              <Link to="/inventory/stock">View low stock items</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={stat.highlight ? "border-red-300" : ""}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg}`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <h3 className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </h3>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders + Quick Links */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest activity across all warehouses
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/orders/outbound">
                View All <LuArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !recentOrders?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No recent orders.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {order.customer_name || order.supplier_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[order.status] as any}>
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      ${Number(order.total_amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Quick Links */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Quick Actions</p>
          <div className="flex flex-col gap-4">
            {quickLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.bg}`}
                    >
                      <link.icon className={`h-5 w-5 ${link.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{link.label}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        View all <LuArrowUpRight className="h-3 w-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
