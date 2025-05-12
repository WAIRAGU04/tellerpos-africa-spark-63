
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CheckoutHeaderProps {
  onBackToCart: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onBackToCart }) => {
  return (
    <div className="bg-primary/5 p-4 flex justify-between items-center">
      <Button variant="ghost" onClick={onBackToCart} className="flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Button>
      <h2 className="text-xl font-bold">Checkout</h2>
      <div className="w-24"></div> {/* For balance */}
    </div>
  );
};

export default CheckoutHeader;
