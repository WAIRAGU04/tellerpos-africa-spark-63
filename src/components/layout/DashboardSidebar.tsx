
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { sidebarItems } from "@/config/navigation";

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  activeModule: string;
  setActiveModule: (value: string) => void;
  userData: UserData;
  greeting: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  collapsed,
  setCollapsed,
  activeModule, 
  setActiveModule,
  userData,
  greeting
}) => {
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (path: string) => {
    const item = sidebarItems.find(item => item.path === path);
    if (item) {
      setActiveModule(item.id);
    }
    navigate(path);
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-tellerpos-dark-accent border-r border-gray-200 dark:border-gray-800 hidden md:block", 
      collapsed ? "w-20" : "w-64"
    )}>
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
            {collapsed && <span className="text-xl font-bold text-tellerpos">T</span>}
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
              <div className="h-10 w-10 bg-tellerpos text-white flex items-center justify-center rounded-full">
                {getInitials(userData.firstName, userData.lastName)}
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
              {collapsed && <span className="sr-only">{item.label}</span>}
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
            aria-label="Logout"
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
