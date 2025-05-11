
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';

interface OfflineAlertProps {
  message?: string;
  showTimestamp?: boolean;
  className?: string;
}

const OfflineAlert: React.FC<OfflineAlertProps> = ({
  message = "You are currently offline. Viewing cached data.",
  showTimestamp = true,
  className
}) => {
  const { isOnline, lastSyncTime } = useOffline(false);

  if (isOnline) return null;

  return (
    <Alert className={`mb-4 bg-amber-50 text-amber-700 border-amber-200 ${className}`}>
      <AlertDescription className="flex items-center">
        <WifiOff className="h-4 w-4 mr-2" />
        {message}
        {showTimestamp && lastSyncTime && (
          <span className="ml-2 text-xs">Last synced: {new Date(lastSyncTime).toLocaleString()}</span>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OfflineAlert;
