
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { POSCheckoutProps, Transaction, PaymentMethod } from '@/types/pos';
import { nanoid } from 'nanoid';
import { ArrowLeft, CreditCard, BanknoteIcon, SmartphoneIcon } from 'lucide-react';
import POSReceiptGenerator from './POSReceiptGenerator';
import POSInvoiceGenerator from './POSInvoiceGenerator';
import POSCustomerSelect from './POSCustomerSelect';
import POSSplitPayment from './POSSplitPayment';
import { useShift } from '@/contexts/ShiftContext';
import { useToast } from '@/hooks/use-toast';

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
  
  // Generate a receipt/invoice number
  const generateReceiptNumber = () => {
    return `RC-${nanoid(8).toUpperCase()}`;
  };

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
        description: `KES ${cartTotal.toLocaleString()} received via ${getPaymentMethodName(paymentMethod)}`
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

  // Get user-friendly payment method name
  const getPaymentMethodName = (method: PaymentMethod): string => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'mpesa-stk': return 'M-Pesa STK Push';
      case 'mpesa-till': return 'M-Pesa Till';
      case 'pochi-la-biashara': return 'Pochi La Biashara';
      case 'bank-transfer': return 'Bank Transfer';
      case 'credit': return 'Customer Credit';
      case 'other-custom': return 'Other Payment';
      default: return method;
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

  // Display payment method selection buttons
  const renderPaymentMethods = () => (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <Button 
        onClick={() => setPaymentMethod('cash')}
        variant={paymentMethod === 'cash' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <BanknoteIcon className="h-6 w-6 mb-2" />
        Cash
      </Button>
      <Button 
        onClick={() => setPaymentMethod('mpesa-stk')}
        variant={paymentMethod === 'mpesa-stk' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <SmartphoneIcon className="h-6 w-6 mb-2" />
        M-Pesa STK
      </Button>
      <Button 
        onClick={() => setPaymentMethod('mpesa-till')}
        variant={paymentMethod === 'mpesa-till' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <SmartphoneIcon className="h-6 w-6 mb-2" />
        M-Pesa Till
      </Button>
      <Button 
        onClick={() => setPaymentMethod('pochi-la-biashara')}
        variant={paymentMethod === 'pochi-la-biashara' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <SmartphoneIcon className="h-6 w-6 mb-2" />
        Pochi La Biashara
      </Button>
      <Button 
        onClick={() => setPaymentMethod('bank-transfer')}
        variant={paymentMethod === 'bank-transfer' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <CreditCard className="h-6 w-6 mb-2" />
        Bank Transfer
      </Button>
      <Button 
        onClick={() => setPaymentMethod('credit')}
        variant={paymentMethod === 'credit' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center disabled:opacity-50"
        disabled={!selectedCustomerId}
      >
        <CreditCard className="h-6 w-6 mb-2" />
        Customer Credit
      </Button>
    </div>
  );

  // Create transaction object for receipt/invoice generation
  const createTransactionObject = (): Transaction => {
    const receiptNum = generateReceiptNumber();
    return {
      id: nanoid(),
      items: cart,
      payments: isSplitPayment ? [] : [{ 
        id: nanoid(), 
        method: paymentMethod, 
        amount: cartTotal,
        timestamp: new Date().toISOString() 
      }],
      total: cartTotal,
      subtotal: cartTotal,
      customerId: selectedCustomerId || undefined,
      timestamp: new Date().toISOString(),
      receiptNumber: receiptNum,
      status: 'completed',
      customerName: selectedCustomerId ? 'Selected Customer' : undefined,
      userId: ''
    };
  };

  // If showing receipt view
  if (showReceipt) {
    const transaction = createTransactionObject();
    
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
    const transaction = createTransactionObject();
    
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
      <div className="bg-primary/5 p-4 flex justify-between items-center">
        <Button variant="ghost" onClick={onBackToCart} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cart
        </Button>
        <h2 className="text-xl font-bold">Checkout</h2>
        <div className="w-24"></div> {/* For balance */}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {isPaymentComplete ? (
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
                <Button onClick={showReceiptView}>Print Receipt</Button>
                <Button variant="outline" onClick={showInvoiceView}>Print Invoice</Button>
                <Button className="col-span-2" onClick={handleNewSale}>New Sale</Button>
              </div>
            </CardContent>
          </Card>
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
            {renderPaymentMethods()}
            
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsSplitPayment(true)}
                className="w-full"
              >
                Split Payment
              </Button>
            </div>
            
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
