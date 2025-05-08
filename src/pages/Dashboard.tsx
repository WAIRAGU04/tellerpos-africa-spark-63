
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Sell, 
  Shift, 
  BarChart3, 
  Package2, 
  Receipt, 
  LineChart, 
  Users, 
  Settings, 
  Building2, 
  LogOut 
} from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";

export interface UserData {
  firstName: string;
  lastName: string;
  businessName: string;
}

// This would come from authentication in a real app
const mockUserData: UserData = {
  firstName: "Christopher",
  lastName: "Njeru",
  businessName: "TechVentures Ltd"
};

export const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "sell", label: "Sell", icon: Sell, path: "/dashboard/sell" },
  { id: "shift", label: "Shift", icon: Shift, path: "/dashboard/shift" },
  { id: "sales", label: "Sales", icon: BarChart3, path: "/dashboard/sales" },
  { id: "stock", label: "Stock", icon: Package2, path: "/dashboard/stock" },
  { id: "accounts", label: "Accounts", icon: Receipt, path: "/dashboard/accounts" },
  { id: "analytics", label: "Analytics", icon: LineChart, path: "/dashboard/analytics" },
  { id: "users", label: "Users", icon: Users, path: "/dashboard/users" },
  { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
  { id: "backoffice", label: "Backoffice", icon: Building2, path: "/dashboard/backoffice" }
];

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-tellerpos-bg">
        <DashboardSidebar 
          userData={mockUserData} 
          activeModule={activeModule} 
          setActiveModule={setActiveModule}
          menuItems={menuItems}
        />
        <SidebarInset className="flex flex-col flex-1">
          <DashboardHeader userData={mockUserData} />
          <DashboardContent activeModule={activeModule} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
