
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { UserData } from "@/types/dashboard";
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { sidebarItems } from "@/lib/navigation";

interface DashboardSidebarProps {
  userData: UserData;
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const DashboardSidebar = ({ 
  userData, 
  activeModule, 
  setActiveModule
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  
  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleMenuClick = (moduleId: string, path: string) => {
    setActiveModule(moduleId);
    navigate(path);
  };
  
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-tellerpos-dark-accent/30">
        <div className="flex items-center gap-2 px-2 py-4">
          <Avatar className="h-10 w-10 bg-tellerpos text-white">
            <AvatarFallback>{getInitials(userData.firstName, userData.lastName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-white truncate">
              {userData.firstName.toUpperCase()} {userData.lastName.toUpperCase()}
            </span>
            <span className="text-xs text-tellerpos/90 truncate">
              {userData.businessName}
            </span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeModule === item.id}
                  onClick={() => handleMenuClick(item.id, item.path)}
                  tooltip={item.label}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <button 
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-2 rounded-md p-2 text-red-500 hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
