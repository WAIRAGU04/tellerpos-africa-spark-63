
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { POSCheckoutProps, PaymentMethod } from '@/types/pos';
import { useShift } from '@/contexts/shift';
import { useToast } from '@/hooks/use-toast';

// Import the new components
import POSReceiptGenerator from './POSReceiptGenerator';
import POSInvoiceGenerator from './POSInvoiceGenerator';
import POSCustomerSelect from './POSCustomerSelect';
import POSSplitPayment from './POSSplitPayment';
import CheckoutHeader from './payment/CheckoutHeader';
import PaymentMethodSelector from './payment/PaymentMethodSelector';
import CheckoutSummary from './payment/CheckoutSummary';
import PaymentSuccessCard from './payment/PaymentSuccessCard';
import { createTransactionObject } from './payment/transactionUtils';

const POSCheckout: React.FC<POSCheckoutProps> = ({ 
  cart, 
  cartTotal, 
  onBackToCart, 
  clearCart, 
  onPaymentComplete 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentAmount, setPaymentAmount] = useState<number>(cartTotal);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [isOnline] = useState(navigator.onLine);
  const { updateShiftWithSale, updateShiftWithSplitSale, activeShift } = useShift();
  const { toast } = useToast();

  // Handle payment process
  const handlePayment = () => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "You must start a shift before processing payments",
        variant: "destructive"
      });
      return;
    }

    try {
      // Record the sale in the shift
      updateShiftWithSale(cart, paymentMethod, cartTotal);
      
      // Mark payment as complete
      setIsPaymentComplete(true);
      
      // Notify parent component (if callback provided)
      if (onPaymentComplete) {
        onPaymentComplete(paymentMethod, cartTotal);
      }
      
      toast({
        title: "Payment successful",
        description: `KES ${cartTotal.toLocaleString()} received via ${paymentMethod}`
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment error",
        description: "There was an issue processing your payment",
        variant: "destructive"
      });
    }
  };

  // Handle split payment completion
  const handleSplitPaymentComplete = (payments: Array<{method: PaymentMethod, amount: number}>) => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "You must start a shift before processing payments",
        variant: "destructive"
      });
      return;
    }

    try {
      // Record the split payment in the shift
      updateShiftWithSplitSale(cart, payments);
      
      // Mark payment as complete
      setIsPaymentComplete(true);
      setIsSplitPayment(false);
      
      toast({
        title: "Split payment successful",
        description: `KES ${cartTotal.toLocaleString()} received via multiple payment methods`
      });
    } catch (error) {
      console.error("Split payment error:", error);
      toast({
        title: "Payment error",
        description: "There was an issue processing your split payment",
        variant: "destructive"
      });
    }
  };

  // Reset state for a new sale
  const handleNewSale = () => {
    clearCart();
    onBackToCart();
  };

  // Show receipt after successful payment
  const showReceiptView = () => {
    setShowReceipt(true);
  };

  // Show invoice after successful payment
  const showInvoiceView = () => {
    setShowInvoice(true);
  };

  // If showing receipt view
  if (showReceipt) {
    const transaction = createTransactionObject(cart, cartTotal, paymentMethod, selectedCustomerId, isSplitPayment);
    
    return (
      <POSReceiptGenerator 
        transaction={transaction}
        receiptNumber={transaction.receiptNumber}
        onClose={handleNewSale}
      />
    );
  }

  // If showing invoice view
  if (showInvoice) {
    const transaction = createTransactionObject(cart, cartTotal, paymentMethod, selectedCustomerId, isSplitPayment);
    
    return (
      <POSInvoiceGenerator 
        transaction={transaction}
        customerName={selectedCustomerId ? 'Selected Customer' : 'Customer'}
        invoiceNumber={transaction.receiptNumber.replace('RC', 'INV')}
        onClose={handleNewSale}
      />
    );
  }

  // If in split payment mode
  if (isSplitPayment) {
    return (
      <POSSplitPayment
        cartTotal={cartTotal}
        onComplete={handleSplitPaymentComplete}
        onCancel={() => setIsSplitPayment(false)}
        isOnline={isOnline}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CheckoutHeader onBackToCart={onBackToCart} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isPaymentComplete ? (
          <PaymentSuccessCard 
            cartTotal={cartTotal}
            onShowReceipt={showReceiptView}
            onShowInvoice={showInvoiceView}
            onNewSale={handleNewSale}
          />
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Customer Information (Optional)</h3>
              <POSCustomerSelect 
                onSelectCustomer={(customerId) => setSelectedCustomerId(customerId)}
                selectedCustomerId={selectedCustomerId}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Customer information is required for credit payments and invoices.
              </p>
            </div>
            
            <h3 className="text-lg font-medium mb-2">Payment Method</h3>
            <PaymentMethodSelector 
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              isCustomerSelected={!!selectedCustomerId}
            />
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsSplitPayment(true)}
                className="w-full"
              >
                Split Payment
              </Button>
            </div>
            
            <CheckoutSummary cartTotal={cartTotal} />
          </>
        )}
      </div>
      
      {/* Footer */}
      {!isPaymentComplete && (
        <div className="border-t p-4">
          <Button onClick={handlePayment} className="w-full h-16 text-lg" disabled={!isOnline && paymentMethod !== 'cash'}>
            Pay KES {cartTotal.toLocaleString()}
          </Button>
        </div>
      )}
    </div>
  );
};

export default POSCheckout;
