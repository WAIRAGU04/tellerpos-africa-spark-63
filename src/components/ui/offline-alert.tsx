
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Database } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';

interface OfflineAlertProps {
  message?: string;
  showTimestamp?: boolean;
  unsyncedCount?: number;
  className?: string;
}

const OfflineAlert: React.FC<OfflineAlertProps> = ({
  message = "You are currently offline. Viewing cached data.",
  showTimestamp = true,
  unsyncedCount = 0,
  className
}) => {
  const { isOnline, lastSyncTime } = useOffline(false);

  if (isOnline) return null;

  return (
    <Alert className={`mb-4 bg-amber-50 text-amber-700 border-amber-200 ${className}`}>
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center">
          <WifiOff className="h-4 w-4 mr-2" />
          {message}
          {showTimestamp && lastSyncTime && (
            <span className="ml-2 text-xs">Last synced: {new Date(lastSyncTime).toLocaleString()}</span>
          )}
        </div>
        
        {unsyncedCount > 0 && (
          <div className="flex items-center text-sm ml-2">
            <Database className="h-3 w-3 mr-1" />
            {unsyncedCount} {unsyncedCount === 1 ? 'item' : 'items'} pending sync
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OfflineAlert;
