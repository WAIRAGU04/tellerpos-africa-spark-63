
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import POSLayout from "@/components/pos/POSLayout";
import { Product, Service, InventoryItem } from '@/types/inventory';
import { CartItem } from '@/types/pos';

const POSPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-t-4 border-b-4 border-tellerpos rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
