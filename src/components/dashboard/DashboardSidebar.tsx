
import { cn } from "@/lib/utils";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserData } from "@/types/dashboard";
import { sidebarItems } from "./SidebarItems";
import { useUserManagement } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { loadUserData } from "@/utils/settingsUtils";
import { logoutUser } from "@/utils/authUtils";

interface DashboardSidebarProps {
  collapsed: boolean;
  activeModule: string;
  greeting: string;
  toggleSidebar: () => void;
  handleNavigation: (path: string) => void;
}

const DashboardSidebar = ({
  collapsed,
  activeModule,
  greeting,
  toggleSidebar,
  handleNavigation
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { currentUser } = useUserManagement();
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    businessName: ""
  });
  
  // Load user data on component mount
  useEffect(() => {
    // If we have currentUser from context, use that
    if (currentUser) {
      setUserData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        businessName: "", // Will be populated from loadUserData if available
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        role: currentUser.role,
        agentCode: currentUser.agentCode
      });
    }
    
    // Get additional user data from settings utils (which includes business name)
    const settingsUserData = loadUserData();
    setUserData(prev => ({
      ...prev,
      businessName: settingsUserData.businessName || prev.businessName || ""
    }));
  }, [currentUser]);

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate("/signup");
  };
  
  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-tellerpos-dark-accent border-r border-gray-200 dark:border-gray-800 hidden md:block", collapsed ? "w-20" : "w-64")}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
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
          {collapsed ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-tellerpos text-white flex items-center justify-center">
                {userData.firstName && userData.lastName ? (
                  <span>{userData.firstName[0]}{userData.lastName[0]}</span>
                ) : (
                  <span>U</span>
                )}
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
          {sidebarItems.map(item => (
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
            onClick={handleLogout}
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
  );
};

export default DashboardSidebar;
