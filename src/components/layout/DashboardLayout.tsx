import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { sidebarItems } from "@/config/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import DashboardTopBar from "./DashboardTopBar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({
  children
}: DashboardLayoutProps) => {
  // Get collapsed state from localStorage if available
  const getInitialCollapsedState = () => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? JSON.parse(savedState) : false;
  };
  
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
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

  // Save sidebar collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
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

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userData={userData}
        greeting={greeting}
      />

      {/* Mobile Sidebar */}
      <DashboardMobileSidebar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        userData={userData}
        greeting={greeting}
      />

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300 ease-in-out flex flex-col", collapsed ? "md:ml-20" : "md:ml-64")}>
        <DashboardTopBar 
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          toggleMobileMenu={toggleMobileMenu}
          activeModule={activeModule}
        />
        
        {/* Module Content */}
        <div className="flex-grow overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
