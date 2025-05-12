
import { Menu, Bell, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarItems } from "@/config/navigation";

interface DashboardTopBarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
  activeModule: string;
}

export const DashboardTopBar: React.FC<DashboardTopBarProps> = ({
  isDarkMode,
  toggleTheme,
  toggleMobileMenu,
  activeModule,
}) => {
  const activeItem = sidebarItems.find(item => item.id === activeModule) || sidebarItems[0];

  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-tellerpos-dark-accent border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <button 
        onClick={toggleMobileMenu} 
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
      >
        <Menu size={20} />
      </button>
      
      <div className="flex-1 md:ml-4">
        <h1 className="font-semibold text-xl text-green-500">
          {activeItem?.label || "Dashboard"}
        </h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50" 
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50" 
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
