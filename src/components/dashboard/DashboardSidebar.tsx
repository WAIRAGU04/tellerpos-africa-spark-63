import { LogOut, Users, ChevronDown, ChevronRight } from "lucide-react";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/utils/authUtils";
import { toast } from "sonner";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  userData: UserData;
  activeModule: string;
  setActiveModule: (module: string) => void;
  menuItems: Array<{
    id: string;
    label: string;
    icon: any;
    path: string;
    subItems?: Array<{
      id: string;
      label: string;
      path: string;
    }>;
  }>;
}

const DashboardSidebar = ({ 
  userData, 
  activeModule, 
  setActiveModule,
  menuItems
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  const handleMenuClick = (moduleId: string, path: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      // Toggle the expanded state for this menu item
      setExpandedItems(prev => 
        prev.includes(moduleId) 
          ? prev.filter(id => id !== moduleId) 
          : [...prev, moduleId]
      );
      
      // For menu items with subItems, we don't navigate on click if on mobile
      if (isMobile) return;
    }
    
    setActiveModule(moduleId);
    navigate(path);
  };
  
  const handleSubItemClick = (moduleId: string, subItemPath: string) => {
    setActiveModule(moduleId);
    navigate(subItemPath);
  };
  
  const handleLogout = () => {
    logoutUser();
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  const isItemActive = (moduleId: string, path: string) => {
    if (activeModule === moduleId) return true;
    
    // Check if current path starts with the menu item path
    // This handles active states for subpages
    return window.location.pathname.startsWith(path) && path !== '/dashboard';
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
            {menuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={isItemActive(item.id, item.path)}
                    onClick={() => handleMenuClick(item.id, item.path, hasSubItems)}
                    tooltip={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {hasSubItems && (
                      isMobile ? (
                        isExpanded ? 
                          <ChevronDown className="ml-auto h-4 w-4" /> : 
                          <ChevronRight className="ml-auto h-4 w-4" />
                      ) : null
                    )}
                  </SidebarMenuButton>
                  
                  {hasSubItems && isExpanded && (
                    <SidebarMenuSub>
                      {item.subItems!.map(subItem => (
                        <SidebarMenuSubItem key={subItem.id}>
                          <SidebarMenuSubButton
                            isActive={window.location.pathname === subItem.path}
                            onClick={() => handleSubItemClick(item.id, subItem.path)}
                          >
                            <span>{subItem.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
            
            {/* Add User Management Link - only for Admin and Managers */}
            {(userData.role === 'Administrator' || userData.role === 'Manager') && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeModule === 'users'}
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
