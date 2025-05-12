
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Calendar, 
  BarChart3, 
  Package2, 
  Wallet, 
  LineChart, 
  Users, 
  Settings, 
  Briefcase 
} from "lucide-react";

// Dashboard routes
export const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  }, 
  {
    id: "pos",
    label: "POS",
    icon: ShoppingBag,
    path: "/dashboard/pos"
  }, 
  {
    id: "shift",
    label: "Shift",
    icon: Calendar,
    path: "/dashboard/shift"
  }, 
  {
    id: "sales",
    label: "Sales",
    icon: BarChart3,
    path: "/dashboard/sales"
  }, 
  {
    id: "stock",
    label: "Stock",
    icon: Package2,
    path: "/dashboard/stock"
  }, 
  {
    id: "accounts",
    label: "Accounts",
    icon: Wallet,
    path: "/dashboard/accounts"
  }, 
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    path: "/dashboard/analytics"
  }, 
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/dashboard/users"
  }, 
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard/settings"
  }, 
  {
    id: "backoffice",
    label: "Backoffice",
    icon: Briefcase,
    path: "/dashboard/backoffice"
  }
];
