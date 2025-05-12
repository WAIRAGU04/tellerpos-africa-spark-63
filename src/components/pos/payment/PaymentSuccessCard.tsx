
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PaymentSuccessCardProps {
  cartTotal: number;
  onShowReceipt: () => void;
  onShowInvoice: () => void;
  onNewSale: () => void;
}

const PaymentSuccessCard: React.FC<PaymentSuccessCardProps> = ({
  cartTotal,
  onShowReceipt,
  onShowInvoice,
  onNewSale
}) => {
  return (
    <Card className="text-center">
      <CardContent className="pt-6 pb-6">
        <div className="rounded-full bg-green-100 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-3">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">Total amount: KES {cartTotal.toLocaleString()}</p>
        
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onShowReceipt}>Print Receipt</Button>
          <Button variant="outline" onClick={onShowInvoice}>Print Invoice</Button>
          <Button className="col-span-2" onClick={onNewSale}>New Sale</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSuccessCard;
