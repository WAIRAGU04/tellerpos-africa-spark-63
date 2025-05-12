
import React from 'react';

interface CheckoutSummaryProps {
  cartTotal: number;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ cartTotal }) => {
  return (
    <div className="mt-8">
      <div className="bg-primary/5 p-4 rounded-md">
        <div className="flex justify-between mb-2">
          <span>Subtotal:</span>
          <span>KES {cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Total:</span>
          <span>KES {cartTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
