
import { Bell, Sun, Moon, Menu } from "lucide-react";
import { sidebarItems } from "./SidebarItems";

interface DashboardHeaderProps {
  activeModule: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleMobileMenu: () => void;
}

const DashboardHeader = ({
  activeModule,
  isDarkMode,
  toggleTheme,
  toggleMobileMenu
}: DashboardHeaderProps) => {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-tellerpos-dark-accent border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
      <button 
        onClick={toggleMobileMenu} 
        className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
      >
        <Menu size={20} />
      </button>
      
      <div className="flex-1 md:ml-4">
        <h1 className="text-green-500 font-extrabold text-2xl">
          {sidebarItems.find(item => item.id === activeModule)?.label || "Dashboard"}
        </h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50">
          <Bell size={20} />
        </button>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
