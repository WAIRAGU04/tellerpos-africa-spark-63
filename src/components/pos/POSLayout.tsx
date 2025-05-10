
import React, { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { CartItem } from '@/types/pos';
import POSInventoryView from './POSInventoryView';
import POSCart from './POSCart';
import POSCheckout from './POSCheckout';

interface POSLayoutProps {
  inventory: InventoryItem[];
  cart: CartItem[];
  addToCart: (item: InventoryItem) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const POSLayout: React.FC<POSLayoutProps> = ({
  inventory,
  cart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
}) => {
  const [isCheckout, setIsCheckout] = useState(false);
  
  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleProceedToCheckout = () => {
    setIsCheckout(true);
  };
  
  const handleBackToCart = () => {
    setIsCheckout(false);
  };
  
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-gray-100 dark:bg-tellerpos-bg">
      {/* Left side - Inventory grid */}
      <div className={`${isCheckout ? 'hidden lg:block lg:w-1/3 xl:w-1/2' : 'w-full lg:w-2/3'} overflow-auto p-4`}>
        <POSInventoryView 
          inventory={inventory}
          addToCart={addToCart}
        />
      </div>
      
      {/* Right side - Cart or Checkout */}
      <div className={`${isCheckout ? 'w-full lg:w-2/3 xl:w-1/2' : 'w-full lg:w-1/3'} border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-tellerpos-dark-accent flex flex-col`}>
        {isCheckout ? (
          <POSCheckout 
            cart={cart}
            cartTotal={cartTotal}
            onBackToCart={handleBackToCart}
          />
        ) : (
          <POSCart 
            cart={cart}
            updateQuantity={updateCartItemQuantity}
            removeItem={removeFromCart}
            clearCart={clearCart}
            cartTotal={cartTotal}
            itemCount={itemCount}
            onCheckout={handleProceedToCheckout}
          />
        )}
      </div>
    </div>
  );
};

export default POSLayout;
