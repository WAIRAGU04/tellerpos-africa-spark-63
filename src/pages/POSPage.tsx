
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import POSLayout from "@/components/pos/POSLayout";
import { Product, Service, InventoryItem } from '@/types/inventory';
import { CartItem } from '@/types/pos';
import { useShift } from '@/contexts/shift'; 
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useOffline } from '@/hooks/use-offline';
import OfflineStatusIndicator from '@/components/ui/offline-status-indicator';
import OfflineAlert from '@/components/ui/offline-alert';
import { cacheData, getCachedData, CACHE_KEYS } from '@/services/offlineService';

const POSPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline, setLastSyncTime } = useOffline();
  const { toast } = useToast();
  const { activeShift, isLoading: isShiftLoading } = useShift();
  const navigate = useNavigate();

  // Load inventory and sync data
  const loadInventoryData = () => {
    // Load inventory from localStorage
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      const parsedInventory = JSON.parse(storedInventory);
      setInventory(parsedInventory);
      
      // Cache for offline use
      cacheData(CACHE_KEYS.INVENTORY, parsedInventory);
    } else {
      // Try to load from offline cache
      const cachedInventory = getCachedData<InventoryItem[]>(CACHE_KEYS.INVENTORY);
      if (cachedInventory.data) {
        setInventory(cachedInventory.data);
      }
    }
    
    // Load cart from localStorage if exists
    const storedCart = localStorage.getItem('posCart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    
    setIsLoading(false);
    setLastSyncTime(new Date().toISOString());
  };

  // Initial data load
  useEffect(() => {
    loadInventoryData();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('posCart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  const handleManualSync = async () => {
    // In a real app, this would sync with a server
    loadInventoryData();
  };

  // Update the addToCart function to use the correct CartItem properties
  const addToCart = (item: InventoryItem) => {
    if (!activeShift) {
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
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
      setCart(updatedCart);
      
      toast({
        title: "Added to cart",
        description: `${item.name} quantity increased in cart.`,
      });
    } else {
      // Item doesn't exist in cart, add it
      const newCartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        total: item.price,
        type: item.type,
        imageUrl: item.imageUrl,
        color: item.color as string,
      };
      
      setCart(prev => [...prev, newCartItem]);
      
      toast({
        title: "Added to cart",
        description: `${item.name} added to cart.`,
      });
    }
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
          item.id === id ? { ...item, quantity, total: item.price * quantity } : item
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

  // No active shift - show a message and redirect button
  if (!activeShift) {
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
      <div className="p-4 flex justify-end">
        <OfflineStatusIndicator 
          showManualSync={true}
          onManualSync={handleManualSync}
        />
      </div>
      
      {!isOnline && <OfflineAlert />}
      
      <POSLayout 
        inventory={inventory}
        cart={cart}
        addToCart={addToCart}
        updateCartItemQuantity={updateCartItemQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
    </DashboardLayout>
  );
};

export default POSPage;
