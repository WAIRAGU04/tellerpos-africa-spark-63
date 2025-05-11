import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartItem, PaymentMethod, PaymentType, Transaction, POSCheckoutProps } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Check, X, Phone, CircleDollarSign, Receipt, Split, Banknote, Loader, Printer, Share2 } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import POSSplitPayment from './POSSplitPayment';
import POSCustomerSelect from './POSCustomerSelect';
import POSReceiptGenerator from './POSReceiptGenerator';
import POSInvoiceGenerator from './POSInvoiceGenerator';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/lib/utils';
import { useShift } from '@/contexts/ShiftContext';

const POSCheckout: React.FC<POSCheckoutProps> = ({
  cart,
  cartTotal,
  onBackToCart,
  clearCart,
  onPaymentComplete
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { updateShiftWithSale, updateShiftWithSplitSale } = useShift();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentType, setPaymentType] = useState<PaymentType>('full');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(cartTotal.toString());
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [amountTendered, setAmountTendered] = useState(cartTotal.toString());
  const [splitAmounts, setSplitAmounts] = useState<Array<{
    method: PaymentMethod;
    amount: number;
  }>>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [showMpesaSTKDialog, setShowMpesaSTKDialog] = useState(false);
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [showPostPaymentDialog, setShowPostPaymentDialog] = useState(false);

  // Generate receipt number
  React.useEffect(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setReceiptNumber(`R-${timestamp}-${random}`);
  }, []);

  const handlePaymentSubmit = () => {
    // Validate credit payment requires a customer
    if (paymentMethod === 'credit' && !selectedCustomerId) {
      setShowCustomerSelect(true);
      return;
    }

    // For split payment - handle differently
    if (paymentType === 'split') {
      // Calculate total of split amounts
      const totalSplit = splitAmounts.reduce((sum, item) => sum + item.amount, 0);

      // Check if split payments add up to the cart total
      if (Math.abs(totalSplit - cartTotal) > 0.01) {
        toast({
          title: "Invalid split amount",
          description: `Split payments must equal the total amount of ${formatCurrency(cartTotal)}`,
          variant: "destructive"
        });
        return;
      }

      // Check if any split payment is credit but no customer is selected
      const hasCreditSplit = splitAmounts.some(split => split.method === 'credit');
      if (hasCreditSplit && !selectedCustomerId) {
        setShowCustomerSelect(true);
        return;
      }

      // Check if there's MPesa payment in the split
      const hasMpesaSTKSplit = splitAmounts.some(split => split.method === 'mpesa-stk');
      if (hasMpesaSTKSplit) {
        // Get the M-Pesa amount from split payments
        const mpesaSplit = splitAmounts.find(split => split.method === 'mpesa-stk');
        if (mpesaSplit) {
          setMpesaAmount(mpesaSplit.amount.toString());
          setShowMpesaSTKDialog(true);
        }
        return;
      }
    }

    // For cash, bank, or other payments - show confirmation dialog
    if (['cash', 'mpesa-till', 'pochi-la-biashara', 'bank-transfer', 'other-custom'].includes(paymentMethod)) {
      setShowConfirmDialog(true);
      return;
    }

    // For MPESA STK, show the M-Pesa dialog
    if (paymentMethod === 'mpesa-stk') {
      setMpesaAmount(cartTotal.toString());
      setShowMpesaSTKDialog(true);
      return;
    }

    // For credit sales
    if (paymentMethod === 'credit') {
      completeTransaction(true);
    }
  };

  const handleMpesaSTKPush = () => {
    // Validate mobile number
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessingPayment(true);
    toast({
      title: "STK Push initiated",
      description: `STK Push sent to ${mobileNumber}. Customer to enter PIN.`
    });

    // Simulate STK completion after 5 seconds
    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowMpesaSTKDialog(false);
      
      // Simulate random success (80% chance)
      if (Math.random() < 0.8) {
        toast({
          title: "Payment successful",
          description: "M-Pesa payment has been confirmed.",
          variant: "default"
        });
        completeTransaction();
      } else {
        toast({
          title: "Payment failed",
          description: "M-Pesa transaction failed or was cancelled by user.",
          variant: "destructive"
        });
      }
    }, 5000);
  };

  const handleConfirmPayment = () => {
    setShowConfirmDialog(false);
    completeTransaction();
  };

  const completeTransaction = (isCredit = false) => {
    // Create transaction object
    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      items: [...cart],
      payments: paymentType === 'split' 
        ? splitAmounts.map(split => ({
            id: `PAY-${Date.now()}-${split.method}`,
            method: split.method,
            amount: split.amount,
            reference: split.method === 'mpesa-stk' ? `MPESA-${Date.now().toString().substring(8)}` : undefined
          }))
        : [{
            id: `PAY-${Date.now()}`,
            method: paymentMethod,
            amount: cartTotal,
            reference: paymentMethod === 'mpesa-stk' ? `MPESA-${Date.now().toString().substring(8)}` : undefined
          }],
      total: cartTotal,
      customerId: selectedCustomerId || undefined,
      timestamp: new Date().toISOString(),
      receiptNumber: isCredit ? `INV-${Date.now().toString().substring(6)}` : receiptNumber,
      status: 'completed',
      isInvoice: isCredit
    };

    setCurrentTransaction(transaction);

    // Save transaction to localStorage
    const existingTransactions = localStorage.getItem('transactions') 
      ? JSON.parse(localStorage.getItem('transactions') || '[]') 
      : [];
    
    localStorage.setItem('transactions', JSON.stringify([...existingTransactions, transaction]));

    // Update shift with payment information
    if (paymentType === 'split') {
      // For split payments, update each payment separately
      updateShiftWithSplitSale(cart, splitAmounts);
    } else {
      // For single payments
      updateShiftWithSale(cart, paymentMethod, cartTotal);
    }

    // Clear cart from localStorage immediately after payment
    localStorage.removeItem('posCart');
    clearCart(); // Clear the cart in the parent component state

    // Call onPaymentComplete if provided
    if (onPaymentComplete) {
      // For split payments, call with the first payment method and total amount
      // This is a simplification - in a real app you might want to handle split payments differently
      if (paymentType === 'split' && splitAmounts.length > 0) {
        onPaymentComplete(splitAmounts[0].method, cartTotal);
      } else {
        onPaymentComplete(paymentMethod, cartTotal);
      }
    }

    // Show post-payment options dialog
    setShowPostPaymentDialog(true);
  };

  const handleTransactionComplete = () => {
    // Close all dialogs
    setShowReceiptDialog(false);
    setShowInvoiceDialog(false);
    setShowPostPaymentDialog(false);
    
    // Return to POS
    onBackToCart();
    
    toast({
      title: currentTransaction?.isInvoice ? "Invoice created" : "Receipt created",
      description: `${currentTransaction?.isInvoice ? 'Invoice' : 'Receipt'} #${currentTransaction?.receiptNumber} created successfully.`,
      variant: "default"
    });
  };

  const handlePrintReceipt = () => {
    if (currentTransaction) {
      // Close the post-payment dialog
      setShowPostPaymentDialog(false);
      
      // Show the appropriate receipt or invoice dialog
      if (currentTransaction.isInvoice) {
        setShowInvoiceDialog(true);
      } else {
        setShowReceiptDialog(true);
      }
    }
  };

  const handleWhatsAppShare = () => {
    if (!currentTransaction) return;
    
    // For WhatsApp sharing, we'll create a message with receipt details
    const businessName = localStorage.getItem('businessData') 
      ? JSON.parse(localStorage.getItem('businessData') || '{}').businessName 
      : 'Our Business';
      
    const receiptDate = new Date(currentTransaction.timestamp).toLocaleString();
    
    let message = `*${currentTransaction.isInvoice ? 'INVOICE' : 'RECEIPT'} from ${businessName}*\n`;
    message += `${currentTransaction.isInvoice ? 'Invoice' : 'Receipt'} #: ${currentTransaction.receiptNumber}\n`;
    message += `Date: ${receiptDate}\n\n`;
    message += `*ITEMS*\n`;
    
    currentTransaction.items.forEach(item => {
      message += `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    message += `\n*TOTAL*: ${formatCurrency(currentTransaction.total)}\n\n`;
    message += `Thank you for your business!`;
    
    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Shared via WhatsApp",
      description: `${currentTransaction.isInvoice ? 'Invoice' : 'Receipt'} details shared via WhatsApp.`,
    });
  };

  const handleCustomerSelected = (customerId: string, name: string) => {
    setSelectedCustomerId(customerId);
    setCustomerName(name);
    setShowCustomerSelect(false);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'mpesa-stk':
      case 'mpesa-till':
      case 'pochi-la-biashara':
        return <Phone className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'credit':
        return <CreditCard className="h-4 w-4" />;
      case 'bank-transfer':
        return <CircleDollarSign className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  return <div className="flex flex-col h-full">
      {/* Checkout header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={onBackToCart}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
          </Button>
          <h2 className="text-lg font-semibold">Checkout</h2>
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1">
        {/* Order summary */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Order Summary</h3>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Items</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Receipt #</span>
              <span>{paymentMethod === 'credit' ? 'Invoice will be generated' : receiptNumber}</span>
            </div>
            <div className="flex justify-between mb-0 font-medium text-lg">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
        </div>
        
        {/* Payment options */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Payment Type</h3>
          <RadioGroup value={paymentType} onValueChange={value => setPaymentType(value as PaymentType)} className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2 border rounded-md p-3">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full" className="flex items-center">
                <Receipt className="h-4 w-4 mr-2" /> Full Payment
              </Label>
            </div>
            <div className="flex items-center space-x-2 border rounded-md p-3">
              <RadioGroupItem value="split" id="split" />
              <Label htmlFor="split" className="flex items-center">
                <Split className="h-4 w-4 mr-2" /> Split Payment
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {paymentType === 'full' ? <div>
            <h3 className="font-medium mb-2">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={value => setPaymentMethod(value as PaymentMethod)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center">
                    <Banknote className="h-4 w-4 mr-2" /> Cash
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="mpesa-stk" id="mpesa-stk" />
                  <Label htmlFor="mpesa-stk" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> M-PESA STK Push
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="mpesa-till" id="mpesa-till" />
                  <Label htmlFor="mpesa-till" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> M-PESA Till
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="pochi-la-biashara" id="pochi-la-biashara" />
                  <Label htmlFor="pochi-la-biashara" className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> Pochi La Biashara
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                  <Label htmlFor="bank-transfer" className="flex items-center">
                    <CircleDollarSign className="h-4 w-4 mr-2" /> Bank Transfer
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" /> Credit
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 border rounded-md p-3">
                  <RadioGroupItem value="other-custom" id="other-custom" />
                  <Label htmlFor="other-custom" className="flex items-center">
                    <Receipt className="h-4 w-4 mr-2" /> Other
                  </Label>
                </div>
              </div>
            </RadioGroup>
            
            {/* Additional fields based on payment method */}
            {paymentMethod === 'cash' && <div className="mt-4 p-4 border rounded-md">
                <Label htmlFor="tendered" className="block mb-2">Amount Tendered</Label>
                <Input id="tendered" type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} />
                
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Change:</span>
                  <span className="font-medium">
                    {formatCurrency(Math.max(0, parseFloat(amountTendered) - cartTotal))}
                  </span>
                </div>
              </div>}
            
            {paymentMethod === 'credit' && <div className="mt-4 p-4 border rounded-md">
                {selectedCustomerId ? <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{customerName}</p>
                      <p className="text-xs text-muted-foreground">Selected Customer</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowCustomerSelect(true)}>
                      Change
                    </Button>
                  </div> : <Button variant="outline" className="w-full" onClick={() => setShowCustomerSelect(true)}>
                    <CreditCard className="mr-2 h-4 w-4" /> Select Customer
                  </Button>}
              </div>}
          </div> : <POSSplitPayment cartTotal={cartTotal} splitAmounts={splitAmounts} setSplitAmounts={setSplitAmounts} selectedCustomerId={selectedCustomerId} showCustomerSelect={() => setShowCustomerSelect(true)} />}
      </div>
      
      {/* Payment action */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
        <Button 
          size="lg" 
          onClick={handlePaymentSubmit} 
          className="w-full font-extrabold text-3xl bg-green-600 hover:bg-green-500 text-rose-950"
          disabled={isProcessingPayment}
        >
          {isProcessingPayment ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2" />
              Processing...
            </span>
          ) : "Complete Payment"}
        </Button>
      </div>
      
      {/* M-Pesa STK Push Dialog */}
      <Dialog open={showMpesaSTKDialog} onOpenChange={setShowMpesaSTKDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>M-PESA STK Push</DialogTitle>
            <DialogDescription>
              Enter the mobile number to receive the M-PESA payment request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mpesa-phone">Mobile Number</Label>
              <Input
                id="mpesa-phone"
                placeholder="0712345678"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={10}
                disabled={isProcessingPayment}
              />
              <p className="text-xs text-muted-foreground">Enter a valid M-PESA registered number</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mpesa-amount">Amount (KES)</Label>
              <Input
                id="mpesa-amount"
                type="number"
                value={mpesaAmount}
                onChange={(e) => setMpesaAmount(e.target.value)}
                disabled={true}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMpesaSTKDialog(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMpesaSTKPush}
              className="bg-green-600 hover:bg-green-500"
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <span className="flex items-center">
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Send STK Push
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentMethod === 'cash' ? <>
                  Please confirm that you've received{' '}
                  <span className="font-medium">{formatCurrency(parseFloat(amountTendered))}</span>
                  {' '}as cash payment.
                </> : paymentMethod === 'mpesa-till' ? <>Please confirm you have received <span className="font-medium">{formatCurrency(cartTotal)}</span> via M-PESA Till.</> : paymentMethod === 'pochi-la-biashara' ? <>Please confirm you have received <span className="font-medium">{formatCurrency(cartTotal)}</span> via Pochi La Biashara.</> : paymentMethod === 'bank-transfer' ? <>Please confirm you have received <span className="font-medium">{formatCurrency(cartTotal)}</span> via Bank Transfer.</> : <>Please confirm you have received <span className="font-medium">{formatCurrency(cartTotal)}</span> via the selected payment method.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <X className="mr-2 h-4 w-4" /> Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment}>
              <Check className="mr-2 h-4 w-4" /> Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Post-Payment Options Dialog */}
      <Dialog open={showPostPaymentDialog} onOpenChange={setShowPostPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Payment Successful</DialogTitle>
            <DialogDescription>
              {currentTransaction?.isInvoice 
                ? `Invoice #${currentTransaction?.receiptNumber} has been created.` 
                : `Receipt #${currentTransaction?.receiptNumber} has been created.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button 
              onClick={handlePrintReceipt} 
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print {currentTransaction?.isInvoice ? 'Invoice' : 'Receipt'}
            </Button>
            
            <Button 
              onClick={handleWhatsAppShare}
              className="w-full flex items-center justify-center"
              variant="outline"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share via WhatsApp
            </Button>
            
            <Button 
              onClick={handleTransactionComplete}
              className="w-full flex items-center justify-center"
            >
              Return to POS
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Receipt Dialog */}
      <AlertDialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <AlertDialogContent className="max-w-md">
          {currentTransaction && (
            <POSReceiptGenerator 
              transaction={currentTransaction} 
              onClose={() => handleTransactionComplete()} 
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Invoice Dialog */}
      <AlertDialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <AlertDialogContent className="max-w-md">
          {currentTransaction && (
            <POSInvoiceGenerator 
              transaction={currentTransaction} 
              customerName={customerName}
              onClose={() => handleTransactionComplete()} 
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Customer Selection Dialog */}
      <POSCustomerSelect open={showCustomerSelect} onOpenChange={setShowCustomerSelect} onCustomerSelected={handleCustomerSelected} />
    </div>;
};

export default POSCheckout;
