
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type OfflineState = {
  isOnline: boolean;
  lastSyncTime: string | null;
  setLastSyncTime: (time: string) => void;
};

export function useOffline(showToasts = true): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(
    localStorage.getItem('last_global_sync_time')
  );

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showToasts) {
        toast({
          title: "You're back online",
          description: "Your changes will now sync automatically.",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (showToasts) {
        toast({
          title: "You're offline",
          description: "You can continue working. Changes will sync when you reconnect.",
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToasts]);

  const updateLastSyncTime = (time: string) => {
    setLastSyncTime(time);
    localStorage.setItem('last_global_sync_time', time);
  };

  return {
    isOnline,
    lastSyncTime,
    setLastSyncTime: updateLastSyncTime,
  };
}
