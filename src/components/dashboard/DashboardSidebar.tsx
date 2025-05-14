
import { LogOut, Users } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/utils/authUtils";
import { toast } from "sonner";

interface DashboardSidebarProps {
  userData: UserData;
  activeModule: string;
  setActiveModule: (module: string) => void;
  menuItems: Array<{
    id: string;
    label: string;
    icon: any;
    path: string;
  }>;
}

const DashboardSidebar = ({ 
  userData, 
  activeModule, 
  setActiveModule,
  menuItems
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  
  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleMenuClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };
  
  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/");
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
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activeModule === item.id}
                  onClick={() => handleMenuClick(item.id)}
                  tooltip={item.label}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            {/* Add User Management Link - only for Admin and Managers */}
            {(userData.role === 'Administrator' || userData.role === 'Manager') && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={window.location.pathname === '/dashboard/users'}
                  onClick={() => navigate('/dashboard/users')}
                  tooltip="User Management"
                >
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator />
        <div className="p-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            <span>Log Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
