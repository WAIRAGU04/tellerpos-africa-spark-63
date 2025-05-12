
import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import DashboardSidebar from "./DashboardSidebar";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { sidebarItems } from "@/lib/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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

  // Get user data from localStorage
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    businessName: "",
    role: ""
  });

  // Set initial greeting and update it periodically
  useEffect(() => {
    setGreeting(getGreeting());
    
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
        lastName: parsedUserData.lastName || "",
        role: parsedUserData.role || "Owner" // Default to Owner if no role is specified
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
        businessName: "Your Business",
        role: "Owner"
      });
    }
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
        {/* Desktop Sidebar */}
        <DashboardSidebar 
          userData={userData} 
          collapsed={collapsed} 
          setCollapsed={setCollapsed}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />

        {/* Mobile Sidebar */}
        <DashboardMobileSidebar
          userData={userData}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          greeting={greeting}
        />

        {/* Main Content */}
        <main className={cn("flex-1 transition-all duration-300 ease-in-out flex flex-col", collapsed ? "md:ml-20" : "md:ml-64")}>
          {/* Top Header Bar */}
          <DashboardHeader userData={userData} />
          
          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="fixed left-4 top-5 z-50">
              <button 
                onClick={toggleMobileMenu} 
                className="p-2 rounded-md bg-tellerpos-dark-accent/50 text-white"
              >
                <Menu size={20} />
                <span className="sr-only">Open menu</span>
              </button>
            </div>
          )}
          
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
