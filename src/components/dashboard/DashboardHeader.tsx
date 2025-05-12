
import { useState, useEffect } from "react";
import { UserData } from "@/types/dashboard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getGreeting } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  userData: UserData;
  toggleMobileMenu?: () => void;
}

const DashboardHeader = ({ userData }: DashboardHeaderProps) => {
  const [greeting, setGreeting] = useState("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Set initial greeting
    setGreeting(getGreeting());
    
    // Update greeting if user keeps app open across time boundaries (check every minute)
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Ensure we have actual user data to display
  const displayName = userData && userData.firstName ? userData.firstName : "User";
  const displayRole = userData && userData.role ? userData.role : "";
  const displayBusiness = userData && userData.businessName ? userData.businessName : "TellerPOS";
  
  return (
    <header className="bg-tellerpos-dark-accent/50 backdrop-blur-lg border-b border-tellerpos-dark-accent/30 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {!isMobile && <SidebarTrigger className="mr-4" />}
          <div className={isMobile ? "ml-8" : ""}>
            <h1 className="text-xl font-semibold text-white">
              {greeting}, {displayName}
              {displayRole && displayRole !== "Owner" && (
                <span className="ml-1 text-sm text-tellerpos-gray-light">({displayRole})</span>
              )}
            </h1>
            <p className="text-sm text-tellerpos-gray-light">
              Welcome to {displayBusiness} dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* We'll implement notifications, settings, etc. later */}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
