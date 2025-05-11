import React, { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { CartItem } from '@/types/pos';
import { Button } from '@/components/ui/button';
import POSInventoryView from './POSInventoryView';
import POSCart from './POSCart';
import POSCheckout from './POSCheckout';
import { useIsMobile } from '@/hooks/use-mobile';
import { ShoppingCart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useShift } from '@/contexts/ShiftContext';

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
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const isMobile = useIsMobile();
  const [showMobileCart, setShowMobileCart] = useState(false);
  
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
  const handlePaymentComplete = (paymentMethod: string, amount: number) => {
    // Clear the cart after successful payment
    clearCart();
    
    // Return to inventory view
    setIsCheckoutMode(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
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
                  className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
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
