import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { POSCheckoutProps, PaymentMethod } from '@/types/pos';
import { useShift } from '@/contexts/shift';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

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
  const [transactionData, setTransactionData] = useState(null);
  const { updateShiftWithSale, updateShiftWithSplitSale, activeShift, recordTransaction } = useShift();
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

    // Check if customer is selected for credit payment
    if (paymentMethod === 'credit' && !selectedCustomerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for credit payment",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create transaction object
      const transaction = createTransactionObject(cart, cartTotal, paymentMethod, selectedCustomerId, false);
      
      // Mark as invoice if it's a credit payment
      if (paymentMethod === 'credit') {
        transaction.isInvoice = true;
      }
      
      // Record the transaction (this updates shift, accounts, and sales records)
      const success = recordTransaction(transaction);
      
      if (success) {
        // Mark payment as complete and store transaction data for receipt/invoice
        setTransactionData(transaction);
        setIsPaymentComplete(true);
        
        // Notify parent component (if callback provided)
        if (onPaymentComplete) {
          onPaymentComplete(paymentMethod, cartTotal);
        }
        
        toast({
          title: "Payment successful",
          description: `KES ${cartTotal.toLocaleString()} received via ${paymentMethod}`
        });
      }
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

    // Check if any payment is on credit and validate customer selection
    const hasCreditPayment = payments.some(payment => payment.method === 'credit');
    if (hasCreditPayment && !selectedCustomerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer when using credit payment",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create transaction object for split payment
      const transaction = createTransactionObject(cart, cartTotal, 'cash', selectedCustomerId, true);
      
      // Add the payments to the transaction
      transaction.payments = payments.map(payment => ({
        id: nanoid(),
        method: payment.method,
        amount: payment.amount,
        timestamp: new Date().toISOString()
      }));
      
      // Mark transaction as invoice if any part is credit
      if (hasCreditPayment) {
        transaction.isInvoice = true;
        
        // Calculate the paid amount (non-credit) and balance amount (credit)
        const creditAmount = payments
          .filter(payment => payment.method === 'credit')
          .reduce((sum, payment) => sum + payment.amount, 0);
          
        transaction.paidAmount = cartTotal - creditAmount;
        transaction.balanceAmount = creditAmount;
      }
      
      // Record the transaction
      const success = recordTransaction(transaction);
      
      if (success) {
        // Store transaction data and mark payment as complete
        setTransactionData(transaction);
        setIsPaymentComplete(true);
        setIsSplitPayment(false);
        
        toast({
          title: "Split payment successful",
          description: `KES ${cartTotal.toLocaleString()} received via multiple payment methods`
        });
      }
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

  // Determine if we should automatically show invoice instead of receipt
  const shouldShowInvoice = () => {
    if (!transactionData) return false;
    
    // Show invoice if transaction is marked as invoice (credit payment)
    if (transactionData.isInvoice) return true;
    
    // Otherwise, show invoice if any payment is credit type
    if (transactionData.payments) {
      return transactionData.payments.some(payment => payment.method === 'credit');
    }
    
    return false;
  };

  // If showing receipt view
  if (showReceipt) {
    const transaction = transactionData || createTransactionObject(cart, cartTotal, paymentMethod, selectedCustomerId, isSplitPayment);
    
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
    const transaction = transactionData || createTransactionObject(cart, cartTotal, paymentMethod, selectedCustomerId, isSplitPayment);
    
    return (
      <POSInvoiceGenerator 
        transaction={transaction}
        customerName={selectedCustomerId ? 'Selected Customer' : 'Customer'}
        invoiceNumber={transaction.receiptNumber.replace('RC', 'INV')}
        onClose={handleNewSale}
        paidAmount={transaction.paidAmount}
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
        selectedCustomerId={selectedCustomerId}
        showCustomerSelect={() => {
          setIsSplitPayment(false);
          // Give time for UI to update before showing focus on customer select
          setTimeout(() => {
            document.querySelector('.customer-select')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
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
            onShowReceipt={shouldShowInvoice() ? showInvoiceView : showReceiptView}
            onShowInvoice={showInvoiceView}
            onNewSale={handleNewSale}
            isInvoice={shouldShowInvoice()}
          />
        ) : (
          <>
            <div className="mb-6 customer-select">
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
          <Button 
            onClick={handlePayment} 
            className="w-full h-16 text-lg" 
            disabled={(paymentMethod === 'credit' && !selectedCustomerId) || (!isOnline && paymentMethod !== 'cash')}
          >
            Pay KES {cartTotal.toLocaleString()}
          </Button>
        </div>
      )}
    </div>
  );
};

export default POSCheckout;
