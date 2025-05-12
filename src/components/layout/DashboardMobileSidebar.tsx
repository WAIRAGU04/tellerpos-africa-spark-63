
import { useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import { sidebarItems } from "./DashboardSidebar";

interface DashboardMobileSidebarProps {
  userData: UserData;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeModule: string;
  setActiveModule: (moduleId: string) => void;
  greeting: string;
}

const DashboardMobileSidebar = ({
  userData,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeModule,
  setActiveModule,
  greeting
}: DashboardMobileSidebarProps) => {
  const navigate = useNavigate();
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleNavigation = (path: string) => {
    const item = sidebarItems.find(item => item.path === path);
    if (item) {
      setActiveModule(item.id);
    }
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Ensure we have actual user data to display
  const displayName = userData && userData.firstName ? userData.firstName : "User";
  const displayLastName = userData && userData.lastName ? userData.lastName : "";
  const displayRole = userData && userData.role ? userData.role : "";
  const displayBusiness = userData && userData.businessName ? userData.businessName : "TellerPOS";
  
  return (
    <>
      {/* Mobile sidebar overlay */}
      <div 
        className={cn("fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden", 
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile sidebar */}
      <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-tellerpos-dark-accent transition-transform md:hidden", 
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full")}>
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
            <p className="font-semibold text-sm">
              {displayName} {displayLastName}
              {displayRole && displayRole !== "Owner" && (
                <span className="ml-1 text-xs text-tellerpos">({displayRole})</span>
              )}
            </p>
            <p className="text-xs text-tellerpos">{displayBusiness}</p>
          </div>
        </div>
        
        {/* Mobile Navigation Items */}
        <nav className="px-2 py-4 space-y-1 overflow-y-auto h-[calc(100%-172px)]">
          {sidebarItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => handleNavigation(item.path)} 
              className={cn(
                "flex items-center w-full px-2 py-3 rounded-md transition-colors", 
                activeModule === item.id ? "bg-tellerpos text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50"
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
    </>
  );
};

export default DashboardMobileSidebar;
