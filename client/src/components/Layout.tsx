import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LuLayoutDashboard,
  LuPackageSearch,
  LuCreditCard,
  LuSettings,
  LuLogOut,
  LuChevronLeft,
  LuChevronDown,
  LuMenu,
  LuBox,
  LuPackage,
  LuWarehouse,
} from "react-icons/lu";
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";

import { FaChartBar } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LuLayoutDashboard, path: "/dashboard" },
  {
    label: "Inventory",
    icon: LuPackageSearch,
    children: [
      { label: "Products", icon: LuPackage, path: "/inventory/products" },
      { label: "Warehouses", icon: LuWarehouse, path: "/inventory/warehouses" },
      { label: "Stock Levels", icon: FaChartBar, path: "/inventory/stock" },
    ],
  },
  {
    label: "Inbound Orders",
    icon: IoArrowDownCircleOutline,
    path: "/orders/inbound",
  },
  {
    label: "Outbound Orders",
    icon: IoArrowUpCircleOutline,
    path: "/orders/outbound",
  },
  { label: "Payments", icon: LuCreditCard, path: "/payments" },
];

const bottomItems = [
  { label: "Settings", icon: LuSettings, path: "/settings" },
  { label: "Logout", icon: LuLogOut, path: "/logout" },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Auto-expand parent if child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (child) => location.pathname === child.path,
        );
        if (isChildActive && !expandedItems.includes(item.label)) {
          setExpandedItems((prev) => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: NavItem) => {
    if (item.path) return isActive(item.path);
    if (item.children)
      return item.children.some((child) => isActive(child.path));
    return false;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col p-3">
      {/* Logo */}
      <Link to="/dashboard" className="mb-4 flex h-10 items-center">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <LuBox className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <span className="ml-2 text-[15px] font-semibold whitespace-nowrap">
            StockFlow{" "}
          </span>
        )}
      </Link>

      {/* Main Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          // Item with children
          if (item.children) {
            const isExpanded = expandedItems.includes(item.label);
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isParentActive(item)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="ml-2 flex-1 text-left">
                        {item.label}
                      </span>
                      <LuChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </>
                  )}
                </button>
                {!collapsed && isExpanded && (
                  <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive(child.path)
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <child.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Regular item (no children)
          return (
            <Link
              key={item.path}
              to={item.path!}
              className={cn(
                "flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isActive(item.path!)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-3" />

      {/* Bottom Nav */}
      <div className="mt-auto flex flex-col gap-1">
        {bottomItems.map((item) => {
          if (item.label === "Logout") {
            return (
              <button
                key={item.path}
                onClick={logout}
                className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span className="ml-2">{item.label}</span>}
              </button>
            );
          }
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span className="ml-2">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse Button */}
      {!collapsed ? (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 hidden w-full justify-start lg:flex"
          onClick={() => setCollapsed(true)}
        >
          <LuChevronLeft className="mr-2 h-4 w-4" />
          Collapse
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 hidden w-full justify-center lg:flex"
          onClick={() => setCollapsed(false)}
        >
          <LuChevronLeft className="h-4 w-4 rotate-180" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r bg-white lg:flex lg:flex-col lg:flex-shrink-0 transition-all duration-200",
          collapsed ? "w-[70px]" : "w-[260px]",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b bg-white px-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <LuMenu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10">
              <LuBox className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">StockFlow</span>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
