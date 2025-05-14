import { useState, useEffect, ReactNode } from "react";
import { LayoutDashboard, ShoppingBag, Calendar, BarChart3, Package2, Wallet, LineChart, Users, Settings, Briefcase, LogOut, ChevronLeft, ChevronRight, Menu, Sun, Moon, User, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

// Sidebar menu items - updated to remove "sell" and keep only "pos"
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
  id: "stock",
  label: "Stock",
  icon: Package2,
  path: "/dashboard/stock"
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
  id: "users",
  label: "Users",
  icon: Users,
  path: "/dashboard/users"
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
  onManualSync?: () => Promise<void>;
}

const DashboardLayout = ({
  children,
  onManualSync
}: DashboardLayoutProps) => {
  // Get collapsed state from localStorage if available
  const getInitialCollapsedState = () => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? JSON.parse(savedState) : false;
  };
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Get active module from current path
  const getActiveModule = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    const foundItem = sidebarItems.find(item => path.startsWith(item.path) && item.path !== "/dashboard");
    return foundItem ? foundItem.id : "dashboard";
  };
  const [activeModule, setActiveModule] = useState(getActiveModule());

  // Update active module when location changes
  useEffect(() => {
    setActiveModule(getActiveModule());
  }, [location]);

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
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
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

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
      {/* Using the new DashboardSidebar component with shadcn/ui */}
      <DashboardSidebar 
        userData={userData}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        menuItems={sidebarItems}
      />
      
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden", mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header Bar */}
        <DashboardHeader userData={userData} onManualSync={onManualSync} />
        
        {/* Module Content */}
        <div className="flex-grow overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
