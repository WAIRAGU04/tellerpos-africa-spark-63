
import { useState, useEffect } from "react";
import { UserData } from "@/types/dashboard";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getGreeting } from "@/lib/utils";
import OfflineStatusIndicator from "@/components/ui/offline-status-indicator";
import { useOffline } from "@/hooks/use-offline";

interface DashboardHeaderProps {
  userData: UserData;
  onManualSync?: () => Promise<void>;
}

const DashboardHeader = ({ userData, onManualSync }: DashboardHeaderProps) => {
  const [greeting, setGreeting] = useState("");
  const { isOnline } = useOffline(false);
  
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
    <header className="bg-tellerpos-dark-accent/50 backdrop-blur-lg border-b border-tellerpos-dark-accent/30 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <SidebarTrigger className="mr-4" />
          <div>
            <h1 className="text-xl font-semibold text-white">
              {greeting}, {userData.firstName}
            </h1>
            <p className="text-sm text-tellerpos-gray-light">
              Welcome to your TellerPOS dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <OfflineStatusIndicator 
            showLastSync={true}
            showManualSync={true}
            onManualSync={onManualSync}
            compact={true}
            className="mr-2"
          />
          {/* We'll implement notifications, settings, etc. later */}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
