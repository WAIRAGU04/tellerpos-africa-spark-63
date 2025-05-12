
import React from 'react';

interface CheckoutSummaryProps {
  cartTotal: number;
  taxAmount?: number;
  discount?: number;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ 
  cartTotal, 
  taxAmount = 0, 
  discount = 0 
}) => {
  const subtotal = cartTotal;
  const total = subtotal + taxAmount - discount;
  
  return (
    <div className="mt-8">
      <div className="bg-primary/5 p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>KES {subtotal.toLocaleString()}</span>
        </div>
        
        {taxAmount > 0 && (
          <div className="flex justify-between mb-2">
            <span>Tax:</span>
            <span>KES {taxAmount.toLocaleString()}</span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between mb-2 text-green-600">
            <span>Discount:</span>
            <span>- KES {discount.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total:</span>
          <span>KES {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
