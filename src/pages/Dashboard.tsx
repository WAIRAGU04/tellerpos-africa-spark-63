import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardMobileSidebar } from "@/components/dashboard/DashboardMobileSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { sidebarItems } from "@/config/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  // Get collapsed state from localStorage if available
  const getInitialCollapsedState = () => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState ? JSON.parse(savedState) : false;
  };

  const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [greeting, setGreeting] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const navigate = useNavigate();

  // Get user data from localStorage instead of hardcoded values
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    businessName: ""
  });

  // When the component mounts, set the active module based on the current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    const matchingItem = sidebarItems.find(item => item.path === currentPath);
    if (matchingItem) {
      setActiveModule(matchingItem.id);
    }
  }, []);

  // Save sidebar collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

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
    <SidebarProvider>
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
        <main className={cn("flex-1 transition-all duration-300 ease-in-out", collapsed ? "md:ml-20" : "md:ml-64")}>
          <DashboardTopBar 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            toggleMobileMenu={toggleMobileMenu}
            activeModule={activeModule}
          />
          
          <DashboardContent collapsed={collapsed} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
