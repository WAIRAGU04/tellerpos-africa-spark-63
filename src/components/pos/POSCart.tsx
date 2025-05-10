import React from 'react';
import { CartItem } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Minus, Plus, Package2, FileText, ArrowRight, X } from 'lucide-react';
interface POSCartProps {
  cart: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  onCheckout: () => void;
}
const POSCart: React.FC<POSCartProps> = ({
  cart,
  updateQuantity,
  removeItem,
  clearCart,
  cartTotal,
  itemCount,
  onCheckout
}) => {
  // Helper to render the item's image or color
  const renderItemVisual = (item: CartItem) => {
    if (item.imageUrl) {
      return <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-md" />;
    } else if (item.color) {
      const colorMap: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500'
      };
      return <div className={`w-10 h-10 ${colorMap[item.color]} rounded-md flex items-center justify-center`}>
          {item.type === 'product' ? <Package2 className="w-5 h-5 text-white opacity-50" /> : <FileText className="w-5 h-5 text-white opacity-50" />}
        </div>;
    }

    // Fallback
    return <div className="w-10 h-10 bg-gray-200 dark:bg-tellerpos-dark-accent rounded-md flex items-center justify-center">
        {item.type === 'product' ? <Package2 className="w-5 h-5 text-gray-400" /> : <FileText className="w-5 h-5 text-gray-400" />}
      </div>;
  };
  return <div className="flex flex-col h-full">
      {/* Cart header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Cart 
            {itemCount > 0 && <span className="ml-2 bg-primary text-white text-xs rounded-full px-2 py-0.5">
                {itemCount}
              </span>}
          </h2>
          
          {cart.length > 0 && <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>}
        </div>
      </div>
      
      {/* Cart items */}
      <div className="flex-grow overflow-auto">
        {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground">Add items from the inventory to start a sale</p>
          </div> : <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cart.map(item => <li key={item.id} className="p-3 hover:bg-gray-50 dark:hover:bg-tellerpos-bg/20">
                <div className="flex items-center">
                  {renderItemVisual(item)}
                  
                  <div className="ml-3 flex-grow overflow-hidden">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(item.price)} each
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      
                      <span className="min-w-[2rem] text-center">{item.quantity}</span>
                      
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div className="text-right min-w-[4.5rem]">
                      {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(item.price * item.quantity)}
                    </div>
                    
                    <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 h-7 w-7">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>)}
          </ul>}
      </div>
      
      {/* Cart total and checkout button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">
            {new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
          }).format(cartTotal)}
          </span>
        </div>
        
        <Button size="lg" disabled={cart.length === 0} onClick={onCheckout} className="w-full text-white text-xl font-extrabold">
          Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>;
};
export default POSCart;