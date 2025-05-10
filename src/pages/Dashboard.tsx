import { useState, useEffect } from "react";
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
  Briefcase,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  User,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import SettingsPage from "./settings/SettingsPage";

// Dashboard routes
const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "sell",
    label: "Sell",
    icon: ShoppingBag,
    path: "/dashboard/sell",
  },
  {
    id: "shift",
    label: "Shift",
    icon: Calendar,
    path: "/dashboard/shift",
  },
  {
    id: "sales",
    label: "Sales",
    icon: BarChart3,
    path: "/dashboard/sales",
  },
  {
    id: "stock",
    label: "Stock",
    icon: Package2,
    path: "/dashboard/stock",
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: Wallet,
    path: "/dashboard/accounts",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    path: "/dashboard/analytics",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/dashboard/users",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
  {
    id: "backoffice",
    label: "Backoffice",
    icon: Briefcase,
    path: "/dashboard/backoffice",
  }
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("/dashboard");
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();

  // In a real application, this would come from an authentication system
  // For now, we'll use mock data
  const userData: UserData = {
    firstName: "Christopher",
    lastName: "Njeru",
    businessName: "AMAZING SHOP"
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    setActiveModule(path);
    navigate(path);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };
  
  // When the component mounts, set the active module based on the current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    const matchingItem = sidebarItems.find(item => item.path === currentPath);
    if (matchingItem) {
      setActiveModule(matchingItem.id);
    }
  }, []);

  // Set initial greeting and update it periodically
  useEffect(() => {
    // Set initial greeting
    setGreeting(getGreeting());
    
    // Update greeting if user keeps app open across time boundaries (check every minute)
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-tellerpos-dark-accent border-r border-gray-200 dark:border-gray-800 hidden md:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className={cn(
              "flex items-center transition-all",
              collapsed ? "justify-center w-full" : "justify-start"
            )}>
              {!collapsed && (
                <span className="text-xl font-bold">
                  <span className="text-tellerpos">Teller</span>
                  <span>POS</span>
                </span>
              )}
              {collapsed && (
                <span className="text-xl font-bold text-tellerpos">T</span>
              )}
            </div>
            
            <button 
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-tellerpos-bg transition-colors",
                collapsed && "absolute right-0 transform translate-x-1/2 bg-white dark:bg-tellerpos-dark-accent border border-gray-200 dark:border-gray-800 rounded-full"
              )}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className={cn(
            "px-4 py-5 border-b border-gray-200 dark:border-gray-800",
            collapsed ? "flex justify-center" : ""
          )}>
            {collapsed ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-tellerpos text-white flex items-center justify-center">
                  <User size={20} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{greeting},</p>
                <p className="font-semibold text-sm">{userData.firstName} {userData.lastName}</p>
                <p className="text-xs text-tellerpos">{userData.businessName}</p>
              </div>
            )}
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center w-full px-2 py-3 rounded-md transition-colors",
                  activeModule === item.id 
                    ? "bg-tellerpos text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <item.icon size={20} className={collapsed ? "" : "mr-3"} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
          
          {/* Logout Button */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate("/")}
              className={cn(
                "flex items-center w-full px-2 py-3 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <LogOut size={20} className={collapsed ? "" : "mr-3"} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden",
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-tellerpos-dark-accent transition-transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-bold">
              <span className="text-tellerpos">Teller</span>
              <span>POS</span>
            </span>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{greeting},</p>
              <p className="font-semibold text-sm">{userData.firstName} {userData.lastName}</p>
              <p className="text-xs text-tellerpos">{userData.businessName}</p>
            </div>
          </div>
          
          {/* Mobile Navigation Items */}
          <nav className="px-2 py-4 space-y-1 overflow-y-auto h-[calc(100%-172px)]">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center w-full px-2 py-3 rounded-md transition-colors",
                  activeModule === item.id 
                    ? "bg-tellerpos text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50"
                )}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* Mobile Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate("/")}
              className="flex items-center w-full px-2 py-3 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        collapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-tellerpos-dark-accent border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1 md:ml-4">
            <h1 className="text-xl font-semibold">{sidebarItems.find(item => item.path === activeModule)?.label || "Dashboard"}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50">
              <Moon size={20} />
            </button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-4 md:p-6 h-[calc(100%-64px)] overflow-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Dashboard Cards */}
                  <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Today's Sales</h3>
                    <p className="text-2xl font-bold">KSh 24,500</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm font-medium">+12%</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Products Sold</h3>
                    <p className="text-2xl font-bold">51</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm font-medium">+8%</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Active Customers</h3>
                    <p className="text-2xl font-bold">24</p>
                    <div className="flex items-center mt-2">
                      <span className="text-red-500 text-sm font-medium">-2%</span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Inventory Value</h3>
                    <p className="text-2xl font-bold">KSh 459,200</p>
                    <div className="flex items-center mt-2">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">32 products low in stock</span>
                    </div>
                  </div>
                </div>
              } 
            />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<div>Coming soon...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
