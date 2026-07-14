import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuthStore } from "@/stores/auth-store";
import {
  LuPackage,
  LuClipboardCheck,
  LuTruck,
  LuDollarSign,
  LuArrowUpRight,
  LuPlus,
  LuDownload,
} from "react-icons/lu";
import { LuTriangleAlert } from "react-icons/lu";

import { cn } from "@/lib/utils";

const statCards = [
  {
    label: "Total Products",
    value: 0,
    icon: LuPackage,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    label: "Low Stock Alerts",
    value: 0,
    icon: LuTriangleAlert,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
    highlight: false,
  },
  {
    label: "Pending Orders",
    value: 0,
    icon: LuClipboardCheck,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
  },
  {
    label: "Shipped Today",
    value: 0,
    icon: LuTruck,
    iconColor: "text-info",
    iconBg: "bg-info/10",
  },
  {
    label: "Revenue Today",
    value: "$0",
    icon: LuDollarSign,
    iconColor: "text-success",
    iconBg: "bg-success/10",
  },
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] || "there"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Here's what's happening in your warehouse today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">
            <LuPlus className="mr-1.5 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className={cn(
              "transition-shadow hover:shadow-md",
              stat.highlight && "border-destructive/30",
            )}
          >
            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    stat.iconBg,
                  )}
                >
                  <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {stat.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest orders across all warehouses
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <LuDownload className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              View All
              <LuArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground py-8"
              >
                No orders yet. Create your first order to get started.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LuPackage className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">View Inventory</p>
              <p className="text-xs text-muted-foreground">
                Check stock levels
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <LuTruck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium">Inbound Orders</p>
              <p className="text-xs text-muted-foreground">Receive stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <LuClipboardCheck className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm font-medium">Outbound Orders</p>
              <p className="text-xs text-muted-foreground">Ship stock</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
              <LuDollarSign className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm font-medium">Payments</p>
              <p className="text-xs text-muted-foreground">View transactions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
