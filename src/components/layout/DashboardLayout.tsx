
import { useState, useEffect, ReactNode } from "react";
import { LayoutDashboard, ShoppingBag, Calendar, BarChart3, Package2, Wallet, LineChart, Users, Settings, Briefcase, LogOut, ChevronLeft, ChevronRight, Menu, Sun, Moon, User, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/ui/theme-provider";

// Sidebar menu items - updated to match App.tsx routes
const sidebarItems = [{
  id: "dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  path: "/dashboard"
}, {
  id: "pos",
  label: "POS",
  icon: ShoppingBag,
  path: "/dashboard/pos"
}, {
  id: "shift",
  label: "Shift",
  icon: Calendar,
  path: "/dashboard/shift"
}, {
  id: "sales",
  label: "Sales",
  icon: BarChart3,
  path: "/dashboard/sales"
}, {
  id: "inventory", // Changed from "stock" to "inventory" to match App.tsx route
  label: "Stock",
  icon: Package2,
  path: "/dashboard/inventory"
}, {
  id: "accounts",
  label: "Accounts",
  icon: Wallet,
  path: "/dashboard/accounts"
}, {
  id: "analytics",
  label: "Analytics",
  icon: LineChart,
  path: "/dashboard/analytics"
}, {
  id: "settings",
  label: "Settings",
  icon: Settings,
  path: "/dashboard/settings"
}, {
  id: "backoffice",
  label: "Backoffice",
  icon: Briefcase,
  path: "/dashboard/backoffice"
}];

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
    businessName: ""
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
  
  return <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
      {/* Sidebar for desktop */}
      <aside className={cn("fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-tellerpos-dark-accent border-r border-gray-200 dark:border-gray-800 hidden md:block", collapsed ? "w-20" : "w-64")}>
        {/* Sidebar Header */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className={cn("flex items-center transition-all", collapsed ? "justify-center w-full" : "justify-start")}>
              {!collapsed && <span className="text-xl font-bold">
                  <span className="text-tellerpos">Teller</span>
                  <span>POS</span>
                </span>}
              {collapsed && <span className="text-xl font-bold text-tellerpos">T</span>}
            </div>
            
            <button onClick={toggleSidebar} className={cn("p-2 rounded-md hover:bg-gray-100 dark:hover:bg-tellerpos-bg transition-colors", collapsed && "absolute right-0 transform translate-x-1/2 bg-white dark:bg-tellerpos-dark-accent border border-gray-200 dark:border-gray-800 rounded-full")}>
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className={cn("px-4 py-5 border-b border-gray-200 dark:border-gray-800", collapsed ? "flex justify-center" : "")}>
            {collapsed ? <div className="flex flex-col items-center">
                <Avatar className="h-10 w-10 bg-tellerpos text-white">
                  <AvatarFallback>{getInitials(userData.firstName, userData.lastName)}</AvatarFallback>
                </Avatar>
              </div> : <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{greeting},</p>
                <p className="font-semibold text-sm">{userData.firstName} {userData.lastName}</p>
                <p className="text-xs text-tellerpos">{userData.businessName}</p>
              </div>}
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map(item => <button key={item.id} onClick={() => handleNavigation(item.path)} className={cn("flex items-center w-full px-2 py-3 rounded-md transition-colors", activeModule === item.id ? "bg-tellerpos text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50", collapsed ? "justify-center" : "justify-start")}>
                <item.icon size={20} className={collapsed ? "" : "mr-3"} />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && <span className="sr-only">{item.label}</span>}
              </button>)}
          </nav>
          
          {/* Logout Button */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-800">
            <button onClick={() => navigate("/")} className={cn("flex items-center w-full px-2 py-3 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50", collapsed ? "justify-center" : "justify-start")} aria-label="Logout">
              <LogOut size={20} className={collapsed ? "" : "mr-3"} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden", mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile sidebar */}
      <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-tellerpos-dark-accent transition-transform md:hidden", mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold">
            <span className="text-tellerpos">Teller</span>
            <span>POS</span>
          </span>
          <button onClick={toggleMobileMenu} className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
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
          {sidebarItems.map(item => <button key={item.id} onClick={() => handleNavigation(item.path)} className={cn("flex items-center w-full px-2 py-3 rounded-md transition-colors", activeModule === item.id ? "bg-tellerpos text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50")}>
              <item.icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </button>)}
        </nav>
        
        {/* Mobile Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-4 border-t border-gray-200 dark:border-gray-800">
          <button onClick={() => navigate("/")} className="flex items-center w-full px-2 py-3 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50">
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
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
    </div>;
};
export default DashboardLayout;

