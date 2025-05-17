
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { CartItem, PaymentMethod } from '@/types/pos';
import { Button } from '@/components/ui/button';
import POSInventoryView from './POSInventoryView';
import POSCart from './POSCart';
import POSCheckout from './POSCheckout';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingCart, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useShift } from '@/contexts/shift';

interface POSLayoutProps {
  inventory: InventoryItem[];
  cart: CartItem[];
  addToCart: (item: InventoryItem) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  onPaymentComplete?: () => void;
}

const POSLayout: React.FC<POSLayoutProps> = ({
  inventory,
  cart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  onPaymentComplete
}) => {
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const isMobile = useIsMobile();
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);
  
  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    setIsCheckoutMode(true);
    if (isMobile) {
      setShowMobileCart(false);
    }
  };

  const handleBackToCart = () => {
    setIsCheckoutMode(false);
  };

  // Handle successful payment/checkout
  const handlePaymentComplete = (paymentMethod: PaymentMethod, amount: number) => {
    // Clear the cart after successful payment
    clearCart();
    
    // Return to inventory view
    setIsCheckoutMode(false);
    
    // Call the parent callback if provided
    if (onPaymentComplete) {
      onPaymentComplete();
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-amber-500 text-white p-2 text-center text-sm">
          You are currently offline. Some features may be limited.
        </div>
      )}
      
      {/* Inventory section - always visible */}
      <div className={`flex-1 overflow-auto ${isCheckoutMode && !isMobile ? 'hidden md:block' : ''}`}>
        <POSInventoryView 
          inventory={inventory}
          addToCart={addToCart}
        />
      </div>
      
      {/* Cart/checkout section - visible on desktop, in a sheet on mobile */}
      {isMobile ? (
        <>
          {/* Floating cart button for mobile */}
          {!isCheckoutMode && (
            <Sheet open={showMobileCart} onOpenChange={setShowMobileCart}>
              <SheetTrigger asChild>
                <Button 
                  className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="icon"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                <div className="h-full">
                  <POSCart 
                    cart={cart}
                    updateQuantity={updateCartItemQuantity}
                    removeItem={removeFromCart}
                    clearCart={clearCart}
                    cartTotal={cartTotal}
                    itemCount={itemCount}
                    onCheckout={handleCheckout}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          {/* Full-screen checkout for mobile */}
          {isCheckoutMode && (
            <div className="fixed inset-0 z-50 bg-background">
              <POSCheckout 
                cart={cart} 
                cartTotal={cartTotal} 
                onBackToCart={handleBackToCart}
                clearCart={clearCart}
                onPaymentComplete={handlePaymentComplete}
              />
            </div>
          )}
        </>
      ) : (
        /* Desktop layout */
        <div className="w-full md:w-[400px] border-l border-border">
          {isCheckoutMode ? (
            <POSCheckout 
              cart={cart} 
              cartTotal={cartTotal} 
              onBackToCart={handleBackToCart}
              clearCart={clearCart}
              onPaymentComplete={handlePaymentComplete}
            />
          ) : (
            <POSCart 
              cart={cart}
              updateQuantity={updateCartItemQuantity}
              removeItem={removeFromCart}
              clearCart={clearCart}
              cartTotal={cartTotal}
              itemCount={itemCount}
              onCheckout={handleCheckout}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default POSLayout;
