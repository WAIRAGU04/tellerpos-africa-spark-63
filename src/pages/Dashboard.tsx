import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn, getGreeting } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { sidebarItems } from "@/components/dashboard/SidebarItems";
import { isAuthenticated } from "@/utils/authUtils";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModule, setActiveModule] = useState("dashboard");
  const [greeting, setGreeting] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const navigate = useNavigate();

  // Get user data from localStorage instead of hardcoded values
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    businessName: ""
  });

  // Check authentication status on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/signup");
      return;
    }
  }, [navigate]);

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
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleNavigation = (path: string) => {
    const matchingItem = sidebarItems.find(item => item.path === path);
    if (matchingItem) {
      setActiveModule(matchingItem.id);
    }
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
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        collapsed={collapsed} 
        activeModule={activeModule}
        greeting={greeting} 
        toggleSidebar={toggleSidebar}
        handleNavigation={handleNavigation}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        mobileMenuOpen={mobileMenuOpen}
        activeModule={activeModule}
        greeting={greeting}
        toggleMobileMenu={toggleMobileMenu}
        handleNavigation={handleNavigation}
      />

      {/* Main Content */}
      <main className={cn("flex-1 transition-all duration-300 ease-in-out", collapsed ? "md:ml-20" : "md:ml-64")}>
        {/* Header */}
        <DashboardHeader 
          activeModule={activeModule}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          toggleMobileMenu={toggleMobileMenu}
        />
        
        {/* Dashboard Content */}
        {activeModule === "dashboard" ? (
          <DashboardContent collapsed={collapsed} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="bg-tellerpos-dark-accent/20 border border-tellerpos-dark-accent/30 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-tellerpos mb-4">
                {sidebarItems.find(item => item.id === activeModule)?.label || "Unknown"} Module
              </h2>
              <p className="text-tellerpos-gray-light">
                This module will be implemented in future updates. Stay tuned!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
