
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Sync } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OfflineStatusIndicatorProps {
  showLastSync?: boolean;
  showManualSync?: boolean;
  onManualSync?: () => Promise<void>;
  compact?: boolean;
  className?: string;
}

const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({
  showLastSync = true,
  showManualSync = false,
  onManualSync,
  compact = false,
  className
}) => {
  const { isOnline, lastSyncTime } = useOffline(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncResult, setSyncResult] = React.useState<'success' | 'error' | null>(null);

  const handleManualSync = async () => {
    if (!isOnline || !onManualSync || isSyncing) return;
    
    setIsSyncing(true);
    setSyncResult(null);
    try {
      await onManualSync();
      setSyncResult('success');
      // Reset the success message after 3 seconds
      setTimeout(() => setSyncResult(null), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResult('error');
      // Reset the error message after 3 seconds
      setTimeout(() => setSyncResult(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {isOnline ? (
              <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                <Wifi className="h-3 w-3" /> {compact ? '' : 'Online'}
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                <WifiOff className="h-3 w-3" /> {compact ? '' : 'Offline'}
              </Badge>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isOnline ? 'Connected to the server' : 'No connection to the server'}
              {lastSyncTime && (
                <>
                  <br />
                  Last synced: {new Date(lastSyncTime).toLocaleString()}
                </>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showLastSync && lastSyncTime && !compact && (
        <span className="text-xs text-muted-foreground">
          Last synced: {new Date(lastSyncTime).toLocaleString()}
        </span>
      )}
      
      {showManualSync && onManualSync && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size={compact ? "icon" : "sm"} 
                onClick={handleManualSync} 
                disabled={!isOnline || isSyncing}
                title="Sync data"
                className={cn(
                  "ml-auto transition-colors",
                  isSyncing && "animate-pulse",
                  syncResult === 'success' && "bg-green-100 text-green-700 border-green-300 hover:bg-green-200",
                  syncResult === 'error' && "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"
                )}
              >
                <Sync className={cn(
                  "h-4 w-4", 
                  isSyncing && "animate-spin",
                  syncResult === 'success' && "text-green-700",
                  syncResult === 'error' && "text-red-700"
                )} />
                {!compact && (
                  <span className="ml-2">
                    {isSyncing ? "Syncing" : 
                     syncResult === 'success' ? "Synced" : 
                     syncResult === 'error' ? "Failed" : "Sync"}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSyncing ? "Syncing data with server..." : 
               syncResult === 'success' ? "Data successfully synchronized" : 
               syncResult === 'error' ? "Sync failed. Try again." : 
               isOnline ? "Manually sync data with server" : "Cannot sync while offline"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;
