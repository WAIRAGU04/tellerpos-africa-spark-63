import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { CartItem } from '@/types/pos';
import POSInventoryView from './POSInventoryView';
import POSCart from './POSCart';
import POSCheckout from './POSCheckout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

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
  const isMobile = useIsMobile();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Calculate cart totals
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleProceedToCheckout = () => {
    setIsCheckout(true);
    if (isMobile) {
      setIsMobileCartOpen(false);
    }
  };
  
  const handleBackToCart = () => {
    setIsCheckout(false);
  };

  // Close mobile cart when switching to checkout
  useEffect(() => {
    if (isCheckout && isMobileCartOpen) {
      setIsMobileCartOpen(false);
    }
  }, [isCheckout]);
  
  // Mobile view with drawer
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100 dark:bg-tellerpos-bg">
        {/* Main Content - Inventory */}
        <div className="flex-1 overflow-auto p-4">
          <POSInventoryView 
            inventory={inventory}
            addToCart={addToCart}
          />
        </div>
        
        {/* Floating Cart Button */}
        {!isCheckout && (
          <Drawer open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
            <DrawerTrigger asChild>
              <button className="fixed bottom-4 right-4 bg-tellerpos text-white p-3 rounded-full shadow-lg flex items-center justify-center z-10">
                <ShoppingCart size={24} />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {itemCount}
                  </Badge>
                )}
              </button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <div className="px-4 pb-4">
                <div className="h-1 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <POSCart 
                  cart={cart}
                  updateQuantity={updateCartItemQuantity}
                  removeItem={removeFromCart}
                  clearCart={clearCart}
                  cartTotal={cartTotal}
                  itemCount={itemCount}
                  onCheckout={handleProceedToCheckout}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}
        
        {/* Checkout Full Screen on Mobile */}
        {isCheckout && (
          <div className="fixed inset-0 bg-white dark:bg-tellerpos-dark-accent z-20">
            <POSCheckout 
              cart={cart}
              cartTotal={cartTotal}
              onBackToCart={handleBackToCart}
            />
          </div>
        )}
      </div>
    );
  }
  
  // Desktop view (unchanged)
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
