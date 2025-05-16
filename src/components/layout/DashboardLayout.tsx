import { useState, useEffect, ReactNode } from "react";
import { LayoutDashboard, ShoppingBag, Calendar, BarChart3, Package2, Wallet, LineChart, Users, Settings, Briefcase, LogOut, ChevronLeft, ChevronRight, Menu, Sun, Moon, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/ui/theme-provider";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Sidebar menu items with submenus
const sidebarItems = [
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
    path: "/dashboard/sales",
    subItems: [
      {
        id: "sales-overview",
        label: "Overview",
        path: "/dashboard/sales"
      },
      {
        id: "sales-reports",
        label: "Reports",
        path: "/dashboard/sales/reports"
      }
    ]
  }, 
  {
    id: "inventory",
    label: "Stock",
    icon: Package2,
    path: "/dashboard/inventory",
    subItems: [
      {
        id: "inventory-items",
        label: "Items",
        path: "/dashboard/inventory"
      },
      {
        id: "inventory-categories",
        label: "Categories",
        path: "/dashboard/inventory/categories"
      }
    ]
  }, 
  {
    id: "accounts",
    label: "Accounts",
    icon: Wallet,
    path: "/dashboard/accounts",
    subItems: [
      {
        id: "accounts-overview",
        label: "Overview",
        path: "/dashboard/accounts"
      },
      {
        id: "accounts-transactions",
        label: "Transactions",
        path: "/dashboard/accounts/transactions"
      }
    ]
  }, 
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    path: "/dashboard/analytics",
    subItems: [
      {
        id: "analytics-overview",
        label: "Overview",
        path: "/dashboard/analytics"
      },
      {
        id: "analytics-sales",
        label: "Sales",
        path: "/dashboard/analytics/sales"
      },
      {
        id: "analytics-inventory",
        label: "Inventory",
        path: "/dashboard/analytics/inventory"
      }
    ]
  }, 
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
    subItems: [
      {
        id: "settings-profile",
        label: "Profile",
        path: "/dashboard/settings"
      },
      {
        id: "settings-business",
        label: "Business",
        path: "/dashboard/settings/business"
      },
      {
        id: "settings-appearance",
        label: "Appearance",
        path: "/dashboard/settings/appearance"
      }
    ]
  }, 
  {
    id: "backoffice",
    label: "Backoffice",
    icon: Briefcase,
    path: "/dashboard/backoffice"
  }
];

interface DashboardLayoutProps {
  children: ReactNode;
}
const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  // Use theme provider
  const { theme, setTheme } = useTheme();
  
  // Get collapsed state from localStorage if available, or from theme settings
  const getInitialCollapsedState = () => {
    // First check theme settings
    try {
      const themeSettings = localStorage.getItem("tellerpos_theme_settings");
      if (themeSettings) {
        const parsedSettings = JSON.parse(themeSettings);
        if (parsedSettings.sidebarCollapsed !== undefined) {
          return parsedSettings.sidebarCollapsed;
        }
      }
    } catch (e) {
      console.error("Error reading theme settings:", e);
    }
    
    // Fall back to direct sidebar state
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? JSON.parse(savedState) : false;
  };
  
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Get active module from current path
  const getActiveModule = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    
    // Check for exact path matches first
    const exactMatch = sidebarItems.find(item => item.path === path);
    if (exactMatch) return exactMatch.id;
    
    // Then check for path starts with
    const foundItem = sidebarItems.find(item => 
      path.startsWith(item.path) && item.path !== "/dashboard"
    );
    return foundItem ? foundItem.id : "dashboard";
  };
  
  const [activeModule, setActiveModule] = useState(getActiveModule());

  // Update active module when location changes
  useEffect(() => {
    setActiveModule(getActiveModule());
  }, [location]);

  // Save sidebar collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    
    // Also update theme settings if they exist
    try {
      const themeSettings = localStorage.getItem("tellerpos_theme_settings");
      if (themeSettings) {
        const parsedSettings = JSON.parse(themeSettings);
        parsedSettings.sidebarCollapsed = collapsed;
        localStorage.setItem("tellerpos_theme_settings", JSON.stringify(parsedSettings));
      }
    } catch (e) {
      console.error("Error updating theme settings:", e);
    }
  }, [collapsed]);

  // Get user data from localStorage instead of hardcoded values
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    businessName: "",
    role: "Administrator" // Set default role
  });

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

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedBusinessData = localStorage.getItem('businessData');
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(prev => ({
        ...prev,
        firstName: parsedUserData.firstName || "",
        lastName: parsedUserData.lastName || ""
      }));
    }
    if (storedBusinessData) {
      const parsedBusinessData = JSON.parse(storedBusinessData);
      setUserData(prev => ({
        ...prev,
        businessName: parsedBusinessData.businessName || ""
      }));
    }

    // Fallback if no data is found
    if (!storedUserData && !storedBusinessData) {
      console.log("No user data found, using default values");
      setUserData({
        firstName: "User",
        lastName: "",
        businessName: "Your Business"
      });
    }
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleNavigation = (path: string) => {
    const item = sidebarItems.find(item => item.path === path);
    if (item) {
      setActiveModule(item.id);
    }
    navigate(path);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Determine if dark mode is active
  const isDarkTheme = theme === "dark";
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
        {/* Mobile sidebar overlay */}
        <div className={cn("fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden", mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setMobileMenuOpen(false)} />

        {/* Use the enhanced DashboardSidebar component for both desktop and mobile */}
        {/* Desktop Sidebar */}
        <div className={cn("fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out hidden md:block", collapsed ? "w-20" : "w-64")}>
          <DashboardSidebar 
            userData={userData}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            menuItems={sidebarItems}
          />
        </div>
        
        {/* Mobile Sidebar */}
        <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-tellerpos-dark-accent transition-transform md:hidden", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
          <DashboardSidebar 
            userData={userData}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            menuItems={sidebarItems}
          />
        </div>

        {/* Main Content */}
        <main className={cn("flex-1 transition-all duration-300 ease-in-out flex flex-col", collapsed ? "md:ml-20" : "md:ml-64")}>
          {/* Top Header Bar */}
          <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-tellerpos-dark-accent border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
            <button onClick={toggleMobileMenu} className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden">
              <Menu size={20} />
            </button>
            
            <div className="flex-1 md:ml-4">
              <h1 className="font-semibold text-xl text-green-500">{sidebarItems.find(item => item.id === activeModule)?.label || "Dashboard"}</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50" aria-label="Notifications">
                <Bell size={20} />
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50" aria-label={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}>
                {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>
          
          {/* Module Content */}
          <div className="flex-grow overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
export default DashboardLayout;
