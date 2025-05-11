
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import POSLayout from "@/components/pos/POSLayout";
import { Product, Service, InventoryItem } from '@/types/inventory';
import { CartItem } from '@/types/pos';
import { useShift } from '@/contexts/ShiftContext';
import { Button } from "@/components/ui/button";
import { CalendarClock, WifiOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { initializeAccounts } from '@/services/accountsService';
import { initializeSyncService, initializeOfflineStorage } from '@/services/syncService';

const POSPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();
  const { activeShift, isLoading: isShiftLoading } = useShift();
  const navigate = useNavigate();

  // Initialize offline functionality and sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Syncing your offline transactions...",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "You can continue working, and data will be synced when you're back online.",
        variant: "warning"
      });
    };
    
    // Set up event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initialize accounts if they don't exist
    initializeAccounts();
    
    // Initialize offline storage
    initializeOfflineStorage().then(() => {
      // Initialize sync service after storage is ready
      initializeSyncService();
    });
    
    // Listen for sync completion
    const handleSyncComplete = () => {
      toast({
        title: "Sync complete",
        description: "Your offline transactions have been processed.",
      });
    };
    
    window.addEventListener('syncComplete', handleSyncComplete);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncComplete', handleSyncComplete);
    };
  }, [toast]);

  // Load inventory from localStorage
  useEffect(() => {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
    
    // Load cart from localStorage if exists
    const storedCart = localStorage.getItem('posCart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('posCart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  const addToCart = (item: InventoryItem) => {
    if (!activeShift && isOnline) {
      toast({
        title: "No active shift",
        description: "You must start a shift before making sales",
        variant: "destructive",
      });
      return;
    }

    // Check if the item is already in the cart
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Item already exists in cart, increase quantity
      const updatedCart = [...cart];
      
      // Only increase quantity if there's enough stock for products
      if (item.type === 'product') {
        const product = item as Product;
        const currentCartQty = updatedCart[existingItemIndex].quantity;
        
        if (product.quantity < currentCartQty + 1) {
          toast({
            title: "Cannot add more",
            description: `Only ${product.quantity} ${product.unitOfMeasurement} available in stock.`,
            variant: "destructive",
          });
          return;
        }
      }
      
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Item doesn't exist in cart, add it
      const newCartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type: item.type,
        imageUrl: item.imageUrl,
        color: item.color,
      };
      
      setCart(prev => [...prev, newCartItem]);
    }
    
    toast({
      title: "Added to cart",
      description: `${item.name} added to cart.`,
    });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    // Find the inventory item to verify stock
    const inventoryItem = inventory.find(item => item.id === id);
    
    if (inventoryItem?.type === 'product') {
      const product = inventoryItem as Product;
      
      // Verify if there's enough stock
      if (quantity > product.quantity) {
        toast({
          title: "Cannot add more",
          description: `Only ${product.quantity} ${product.unitOfMeasurement} available in stock.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Update the cart quantity
    if (quantity > 0) {
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === id ? { ...item, quantity } : item
        )
      );
    } else {
      // Remove the item if quantity is zero or negative
      removeFromCart(id);
    }
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(item => item.id === id);
    
    setCart(prev => prev.filter(item => item.id !== id));
    
    if (itemToRemove) {
      toast({
        title: "Removed from cart",
        description: `${itemToRemove.name} removed from cart.`,
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from the cart.",
    });
  };

  if (isLoading || isShiftLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-t-4 border-b-4 border-tellerpos rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // No active shift but offline - allow continue with warning
  if (!activeShift && !isOnline) {
    return (
      <DashboardLayout>
        <div className="bg-yellow-50 p-4 mb-4">
          <div className="flex items-center">
            <WifiOff className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-bold">Offline Mode</h3>
              <p>You're working offline without an active shift. Transactions will be processed when you're back online.</p>
            </div>
          </div>
        </div>
        
        <POSLayout 
          inventory={inventory}
          cart={cart}
          addToCart={addToCart}
          updateCartItemQuantity={updateCartItemQuantity}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          isOffline={true}
        />
      </DashboardLayout>
    );
  }

  // No active shift and online - show message
  if (!activeShift && isOnline) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md p-8 bg-tellerpos-dark-accent/20 rounded-lg">
            <CalendarClock className="h-16 w-16 mx-auto mb-4 text-tellerpos" />
            <h2 className="text-2xl font-bold mb-2">No Active Shift</h2>
            <p className="mb-6 text-tellerpos-gray-light">
              You need to start a shift before you can make sales. Please go to the Shift Management page to start a new shift.
            </p>
            <Button onClick={() => navigate('/dashboard/shift')}>
              Go to Shift Management
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {!isOnline && (
        <div className="bg-yellow-50 p-4 mb-4">
          <div className="flex items-center">
            <WifiOff className="h-6 w-6 text-yellow-500 mr-3" />
            <div>
              <h3 className="font-bold">Offline Mode</h3>
              <p>You're working offline. All transactions will be synced when you reconnect.</p>
            </div>
          </div>
        </div>
      )}
      
      <POSLayout 
        inventory={inventory}
        cart={cart}
        addToCart={addToCart}
        updateCartItemQuantity={updateCartItemQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        isOffline={!isOnline}
      />
    </DashboardLayout>
  );
};

export default POSPage;
