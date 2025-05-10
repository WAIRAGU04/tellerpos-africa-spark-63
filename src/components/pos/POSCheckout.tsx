import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Check, X, Phone, CircleDollarSign, Receipt, Split, Banknote, CashIcon } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentMethod, PaymentType } from '@/types/pos';
import POSSplitPayment from './POSSplitPayment';
import POSCustomerSelect from './POSCustomerSelect';
interface POSCheckoutProps {
  cart: CartItem[];
  cartTotal: number;
  onBackToCart: () => void;
}
const POSCheckout: React.FC<POSCheckoutProps> = ({
  cart,
  cartTotal,
  onBackToCart
}) => {
  const {
    toast
  } = useToast();
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

  // Generate receipt number
  React.useEffect(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    setReceiptNumber(`R-${timestamp}-${random}`);
  }, []);
  const handlePaymentSubmit = () => {
    // Validate mobile number for MPESA
    if (paymentMethod === 'mpesa-stk' && (!mobileNumber || mobileNumber.length !== 10)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive"
      });
      return;
    }

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
          description: `Split payments must equal the total amount of ${new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
          }).format(cartTotal)}`,
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
    }

    // For cash, bank, or other payments - show confirmation dialog
    if (['cash', 'mpesa-till', 'pochi-la-biashara', 'bank-transfer', 'other-custom'].includes(paymentMethod)) {
      setShowConfirmDialog(true);
      return;
    }

    // For MPESA STK, simulate STK push
    if (paymentMethod === 'mpesa-stk') {
      toast({
        title: "STK Push initiated",
        description: `STK Push sent to ${mobileNumber}. Customer to enter PIN.`
      });

      // Simulate STK completion after 3 seconds
      setTimeout(() => {
        completeTransaction();
      }, 3000);
      return;
    }

    // For credit sales
    if (paymentMethod === 'credit') {
      completeTransaction();
    }
  };
  const handleConfirmPayment = () => {
    setShowConfirmDialog(false);
    completeTransaction();
  };
  const completeTransaction = () => {
    // In a real application, we would:
    // 1. Update inventory quantities
    // 2. Save the transaction to the database
    // 3. Generate a receipt
    // 4. Clear the cart

    toast({
      title: "Sale completed",
      description: `Receipt #${receiptNumber} created successfully.`
    });

    // Clear cart from localStorage
    localStorage.removeItem('posCart');

    // Redirect to a success page or receipt page
    // For now, we'll just go back to an empty cart
    onBackToCart();
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
              <span>{receiptNumber}</span>
            </div>
            <div className="flex justify-between mb-0 font-medium text-lg">
              <span>Total</span>
              <span>{new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES'
              }).format(cartTotal)}</span>
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
            {paymentMethod === 'mpesa-stk' && <div className="mt-4 p-4 border rounded-md">
                <Label htmlFor="phone" className="block mb-2">Mobile Number</Label>
                <Input id="phone" type="tel" placeholder="0712345678" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Enter the customer's M-PESA number</p>
              </div>}
            
            {paymentMethod === 'cash' && <div className="mt-4 p-4 border rounded-md">
                <Label htmlFor="tendered" className="block mb-2">Amount Tendered</Label>
                <Input id="tendered" type="number" value={amountTendered} onChange={e => setAmountTendered(e.target.value)} />
                
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Change:</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES'
              }).format(Math.max(0, parseFloat(amountTendered) - cartTotal))}
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
        <Button size="lg" onClick={handlePaymentSubmit} className="w-full font-extrabold text-3xl">
          Complete Payment
        </Button>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              {paymentMethod === 'cash' ? <>
                  Please confirm that you've received{' '}
                  <span className="font-medium">{new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(parseFloat(amountTendered))}</span>
                  {' '}as cash payment.
                </> : paymentMethod === 'mpesa-till' ? <>Please confirm you have received <span className="font-medium">{new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(cartTotal)}</span> via M-PESA Till.</> : paymentMethod === 'pochi-la-biashara' ? <>Please confirm you have received <span className="font-medium">{new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(cartTotal)}</span> via Pochi La Biashara.</> : paymentMethod === 'bank-transfer' ? <>Please confirm you have received <span className="font-medium">{new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(cartTotal)}</span> via Bank Transfer.</> : <>Please confirm you have received <span className="font-medium">{new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES'
                }).format(cartTotal)}</span> via the selected payment method.</>}
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
      
      {/* Customer Selection Dialog */}
      <POSCustomerSelect open={showCustomerSelect} onOpenChange={setShowCustomerSelect} onCustomerSelected={handleCustomerSelected} />
    </div>;
};
export default POSCheckout;