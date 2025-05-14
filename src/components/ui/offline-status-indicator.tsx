
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const handleManualSync = async () => {
    if (!isOnline || !onManualSync || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await onManualSync();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isOnline ? (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
          <Wifi className="h-3 w-3" /> {compact ? '' : 'Online'}
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
          <WifiOff className="h-3 w-3" /> {compact ? '' : 'Offline'}
        </Badge>
      )}
      
      {showLastSync && lastSyncTime && !compact && (
        <span className="text-xs text-muted-foreground">
          Last synced: {new Date(lastSyncTime).toLocaleString()}
        </span>
      )}
      
      {showManualSync && onManualSync && (
        <Button 
          variant="outline" 
          size={compact ? "icon" : "sm"} 
          onClick={handleManualSync} 
          disabled={!isOnline || isSyncing}
          title="Sync data"
          className="ml-auto"
        >
          <Wifi className={cn("h-4 w-4", isSyncing && "animate-pulse")} />
          {!compact && <span className="ml-2">Sync</span>}
        </Button>
      )}
    </div>
  );
};

export default OfflineStatusIndicator;
