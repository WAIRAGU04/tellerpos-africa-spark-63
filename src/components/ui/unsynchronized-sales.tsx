
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Wifi, WifiOff } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Transaction } from '@/types/pos';
import { cn } from '@/lib/utils';

interface UnsynchronizedSalesProps {
  unsyncedSales: Transaction[];
  onSyncSales: () => Promise<void>;
}

const UnsynchronizedSales = ({ unsyncedSales, onSyncSales }: UnsynchronizedSalesProps) => {
  const { isOnline } = useOffline(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await onSyncSales();
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!unsyncedSales.length) return null;
  
  return (
    <Sheet>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className={cn(
                  "relative bg-amber-100 hover:bg-amber-200 border-amber-300",
                  isOnline ? "text-amber-700" : "text-red-700"
                )}
              >
                <Database className="h-4 w-4" />
                <Badge 
                  className="absolute -top-2 -right-2 bg-amber-500 text-white w-5 h-5 flex items-center justify-center p-0"
                >
                  {unsyncedSales.length}
                </Badge>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>You have {unsyncedSales.length} unsynchronized sales</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Unsynchronized Sales
          </SheetTitle>
          <SheetDescription>
            {isOnline ? 
              "These sales haven't been synchronized to the cloud yet." : 
              "You're currently offline. Sales will sync when you reconnect."
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-2">
            {unsyncedSales.map((sale) => (
              <div 
                key={sale.id} 
                className="p-3 border rounded-md bg-muted/30"
              >
                <div className="flex justify-between">
                  <span className="font-medium">KES {sale.amount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sale.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm mt-1 flex justify-between">
                  <span>
                    {sale.paymentMethod === 'credit' ? 'Credit Sale' : 
                      sale.paymentMethod.charAt(0).toUpperCase() + 
                      sale.paymentMethod.slice(1).replace(/-/g, ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {sale.items.length} items
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="flex items-center">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <WifiOff className="h-4 w-4 text-amber-500 mr-2" />
              )}
              <span className="text-sm">
                {isOnline ? "You're online" : "You're offline"}
              </span>
            </div>
            
            <div className="flex gap-2">
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
              <Button 
                onClick={handleSync} 
                disabled={!isOnline || isSyncing}
                className={isSyncing ? "animate-pulse" : ""}
              >
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UnsynchronizedSales;
