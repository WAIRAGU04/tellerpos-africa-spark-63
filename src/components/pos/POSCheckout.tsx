
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  FileText
} from 'lucide-react';
import { CartItem, PaymentMethod, POSCheckoutProps } from '@/types/pos';
import POSSplitPayment from './POSSplitPayment';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { useShift } from '@/contexts/ShiftContext';
import { updateAccountBalance } from '@/services/accountsService';

const POSCheckout: React.FC<POSCheckoutProps> = ({ 
  cart, 
  cartTotal, 
  onBackToCart,
  clearCart,
  onPaymentComplete
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const { toast } = useToast();
  const { activeShift, updateShift } = useShift();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handlePayment = async (method: PaymentMethod) => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    setPaymentMethod(method);
    
    try {
      // Generate receipt number
      const receiptNumber = `INV-${nanoid(6).toUpperCase()}`;
      
      // Create transaction record
      const transaction = {
        id: nanoid(),
        items: [...cart],
        payments: [{
          id: nanoid(),
          method: method,
          amount: cartTotal,
          reference: receiptNumber
        }],
        total: cartTotal,
        timestamp: new Date().toISOString(),
        receiptNumber,
        status: 'completed',
      };
      
      // Store transaction in localStorage
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      
      // Store offline if needed
      if (!isOnline) {
        const pendingTransactions = JSON.parse(localStorage.getItem('pendingPosTransactions') || '[]');
        pendingTransactions.unshift(transaction);
        localStorage.setItem('pendingPosTransactions', JSON.stringify(pendingTransactions));
        
        toast({
          title: "Transaction saved offline",
          description: "It will be synced when you're back online",
        });
      }
      
      // Update account balance
      updateAccountBalance(method, cartTotal, 'increase');
      
      // Update shift records if there's an active shift
      if (activeShift) {
        // Update payment totals in shift
        const updatedPaymentTotals = { ...activeShift.paymentTotals };
        
        switch(method) {
          case 'cash':
            updatedPaymentTotals.cash += cartTotal;
            break;
          case 'mpesa-stk':
          case 'mpesa-till':
            updatedPaymentTotals.mpesa += cartTotal;
            break;
          case 'pochi-la-biashara':
            updatedPaymentTotals.pochiBiashara += cartTotal;
            break;
          case 'bank-transfer':
            updatedPaymentTotals.bankTransfer += cartTotal;
            break;
          case 'credit':
            updatedPaymentTotals.credit += cartTotal;
            break;
        }
        
        updateShift({
          ...activeShift,
          paymentTotals: updatedPaymentTotals,
          totalSales: activeShift.totalSales + cartTotal
        });
      }
      
      // Clear cart and reset state
      setTimeout(() => {
        setIsProcessing(false);
        clearCart();
        
        // Call onPaymentComplete if provided
        if (onPaymentComplete) {
          onPaymentComplete(method, cartTotal);
        }
        
        toast({
          title: "Payment successful",
          description: `Payment of ${new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(cartTotal)} processed`,
          variant: "default",
        });
      }, 1000);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setIsProcessing(false);
      
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSplitPayment = (payments: Array<{method: PaymentMethod, amount: number}>) => {
    setIsProcessing(true);
    
    try {
      // Generate receipt number
      const receiptNumber = `INV-${nanoid(6).toUpperCase()}`;
      
      // Create transaction record with multiple payments
      const transaction = {
        id: nanoid(),
        items: [...cart],
        payments: payments.map(payment => ({
          id: nanoid(),
          method: payment.method,
          amount: payment.amount,
          reference: receiptNumber
        })),
        total: cartTotal,
        timestamp: new Date().toISOString(),
        receiptNumber,
        status: 'completed',
      };
      
      // Store transaction
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.unshift(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));
      
      // Store offline if needed
      if (!isOnline) {
        const pendingTransactions = JSON.parse(localStorage.getItem('pendingPosTransactions') || '[]');
        pendingTransactions.unshift(transaction);
        localStorage.setItem('pendingPosTransactions', JSON.stringify(pendingTransactions));
      }
      
      // Update account balances for each payment method
      payments.forEach(payment => {
        updateAccountBalance(payment.method, payment.amount, 'increase');
      });
      
      // Update shift if active
      if (activeShift) {
        const updatedPaymentTotals = { ...activeShift.paymentTotals };
        
        payments.forEach(payment => {
          switch(payment.method) {
            case 'cash':
              updatedPaymentTotals.cash += payment.amount;
              break;
            case 'mpesa-stk':
            case 'mpesa-till':
              updatedPaymentTotals.mpesa += payment.amount;
              break;
            case 'pochi-la-biashara':
              updatedPaymentTotals.pochiBiashara += payment.amount;
              break;
            case 'bank-transfer':
              updatedPaymentTotals.bankTransfer += payment.amount;
              break;
            case 'credit':
              updatedPaymentTotals.credit += payment.amount;
              break;
          }
        });
        
        updateShift({
          ...activeShift,
          paymentTotals: updatedPaymentTotals,
          totalSales: activeShift.totalSales + cartTotal
        });
      }
      
      // Clear and reset
      setTimeout(() => {
        setIsProcessing(false);
        setIsSplitPayment(false);
        clearCart();
        
        if (onPaymentComplete) {
          // Just pass the first payment method for simplicity
          onPaymentComplete(payments[0].method, cartTotal);
        }
        
        toast({
          title: "Payment successful",
          description: `Split payment of ${new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(cartTotal)} processed`,
          variant: "default",
        });
      }, 1000);
      
    } catch (error) {
      console.error('Split payment error:', error);
      setIsProcessing(false);
      
      toast({
        title: "Payment failed",
        description: "There was an error processing your split payment.",
        variant: "destructive",
      });
    }
  };

  // If split payment mode is active
  if (isSplitPayment) {
    return (
      <POSSplitPayment 
        cartTotal={cartTotal} 
        onComplete={handleSplitPayment}
        onCancel={() => setIsSplitPayment(false)}
        isOnline={isOnline}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBackToCart} disabled={isProcessing}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>
        <h2 className="text-lg font-semibold">Checkout</h2>
        <div></div> {/* Empty div for flex spacing */}
      </div>
      
      {/* Offline warning */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mx-4 mt-4 rounded">
          <p className="font-bold">You are offline</p>
          <p>Your transaction will be saved locally and synced when you're back online.</p>
        </div>
      )}
      
      {/* Cart Summary */}
      <div className="p-4 overflow-auto">
        <h3 className="text-base font-medium mb-2">Order Summary ({cart.length} items)</h3>
        <div className="border rounded-md bg-gray-50 dark:bg-gray-800/50 p-3 mb-4">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex justify-between mb-1 text-sm">
              <span>{item.quantity}× {item.name}</span>
              <span>{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 font-medium flex justify-between">
            <span>Total</span>
            <span>{new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(cartTotal)}</span>
          </div>
        </div>
        
        <h3 className="text-base font-medium mb-2">Payment Method</h3>
        <div className="grid grid-cols-2 gap-2">
          <Card 
            className={`p-4 cursor-pointer ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => !isProcessing && setPaymentMethod('cash')}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <Banknote className="mb-2 h-6 w-6" />
              <span>Cash</span>
            </div>
          </Card>
          
          <Card 
            className={`p-4 cursor-pointer ${paymentMethod === 'mpesa-stk' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => !isProcessing && setPaymentMethod('mpesa-stk')}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <Smartphone className="mb-2 h-6 w-6" />
              <span>M-Pesa</span>
            </div>
          </Card>
          
          <Card 
            className={`p-4 cursor-pointer ${paymentMethod === 'bank-transfer' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => !isProcessing && setPaymentMethod('bank-transfer')}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <Building className="mb-2 h-6 w-6" />
              <span>Bank Transfer</span>
            </div>
          </Card>
          
          <Card 
            className={`p-4 cursor-pointer ${paymentMethod === 'credit' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => !isProcessing && setPaymentMethod('credit')}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="mb-2 h-6 w-6" />
              <span>Credit</span>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Payment buttons */}
      <div className="mt-auto p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full mb-2" 
          onClick={() => setIsSplitPayment(true)}
          disabled={isProcessing}
        >
          Split Payment
        </Button>
        
        <Button 
          className="w-full h-14 text-lg" 
          disabled={isProcessing || cart.length === 0}
          onClick={() => handlePayment(paymentMethod)}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              Pay {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(cartTotal)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default POSCheckout;
