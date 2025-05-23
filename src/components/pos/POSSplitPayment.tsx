
import React, { useState } from 'react';
import { PaymentMethod } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CreditCard, 
  Phone, 
  CircleDollarSign, 
  Receipt, 
  Banknote,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface POSSplitPaymentProps {
  cartTotal: number;
  onComplete?: (payments: Array<{method: PaymentMethod; amount: number}>) => void;
  onCancel?: () => void;
  isOnline?: boolean;
  splitAmounts?: Array<{method: PaymentMethod; amount: number}>;
  setSplitAmounts?: React.Dispatch<React.SetStateAction<Array<{method: PaymentMethod; amount: number}>>>;
  selectedCustomerId?: string | null;
  showCustomerSelect?: () => void;
}

const POSSplitPayment: React.FC<POSSplitPaymentProps> = ({ 
  cartTotal,
  onComplete,
  onCancel,
  isOnline = true,
  splitAmounts: propSplitAmounts,
  setSplitAmounts: propSetSplitAmounts,
  selectedCustomerId,
  showCustomerSelect
}) => {
  // Use either props or local state for split amounts
  const [localSplitAmounts, setLocalSplitAmounts] = useState<Array<{method: PaymentMethod; amount: number}>>([]);
  const [newMethod, setNewMethod] = useState<PaymentMethod>('cash');
  const [newAmount, setNewAmount] = useState('');
  
  // Determine whether to use props or local state
  const splitAmounts = propSplitAmounts !== undefined ? propSplitAmounts : localSplitAmounts;
  
  const setSplitAmounts = (value: Array<{method: PaymentMethod; amount: number}> | ((prev: Array<{method: PaymentMethod; amount: number}>) => Array<{method: PaymentMethod; amount: number}>)) => {
    if (propSetSplitAmounts) {
      propSetSplitAmounts(value);
    } else {
      if (typeof value === 'function') {
        setLocalSplitAmounts(value);
      } else {
        setLocalSplitAmounts(value);
      }
    }
  };
  
  // Calculate remaining amount
  const totalPaid = splitAmounts.reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = cartTotal - totalPaid;
  
  // Check if any payment is credit type
  const hasCreditPayment = splitAmounts.some(item => item.method === 'credit');
  
  const handleAddSplit = () => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0 || amount > remainingAmount) return;
    
    // If method is credit and no customer is selected, show customer select
    if (newMethod === 'credit' && !selectedCustomerId && showCustomerSelect) {
      showCustomerSelect();
      return;
    }
    
    setSplitAmounts(prev => [...prev, { method: newMethod, amount }]);
    setNewAmount('');
  };
  
  const handleRemoveSplit = (index: number) => {
    setSplitAmounts(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleComplete = () => {
    if (onComplete && remainingAmount === 0) {
      // Check if credit payment is included but no customer selected
      if (hasCreditPayment && !selectedCustomerId) {
        if (showCustomerSelect) {
          showCustomerSelect();
        }
        return;
      }
      
      onComplete(splitAmounts);
    }
  };
  
  const getMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'mpesa-stk': return 'M-PESA STK Push';
      case 'mpesa-till': return 'M-PESA Till';
      case 'pochi-la-biashara': return 'Pochi La Biashara';
      case 'bank-transfer': return 'Bank Transfer';
      case 'credit': return 'Credit';
      case 'other-custom': return 'Other';
      default: return method;
    }
  };
  
  const getMethodIcon = (method: PaymentMethod) => {
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
  
  return (
    <div>
      <h3 className="font-medium mb-2">Split Payment</h3>
      
      {/* Show warning if using credit without customer */}
      {hasCreditPayment && !selectedCustomerId && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Customer selection is required when using credit payment. 
            {showCustomerSelect && (
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1" 
                onClick={showCustomerSelect}
              >
                Select a customer now
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Current splits */}
      <div className="mb-4">
        {splitAmounts.length > 0 ? (
          <div className="space-y-2">
            {splitAmounts.map((split, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                <div className="flex items-center">
                  {getMethodIcon(split.method)}
                  <span className="ml-2">{getMethodLabel(split.method)}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(split.amount)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-red-500"
                    onClick={() => handleRemoveSplit(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md bg-gray-50 dark:bg-gray-800">
            <p className="text-muted-foreground">No split payments added yet</p>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Total paid</span>
            <span>
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalPaid)}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Remaining amount</span>
            <span>
              {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(remainingAmount)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Add new split */}
      {remainingAmount > 0 && (
        <div className="border rounded-md p-4">
          <h4 className="text-sm font-medium mb-3">Add Payment</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <div className="sm:col-span-2">
              <Label htmlFor="splitMethod" className="sr-only">Payment method</Label>
              <Select 
                value={newMethod} 
                onValueChange={(value) => setNewMethod(value as PaymentMethod)}
              >
                <SelectTrigger id="splitMethod">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="mpesa-stk">M-PESA STK Push</SelectItem>
                    <SelectItem value="mpesa-till">M-PESA Till</SelectItem>
                    <SelectItem value="pochi-la-biashara">Pochi La Biashara</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="other-custom">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:col-span-2">
              <Label htmlFor="splitAmount" className="sr-only">Amount</Label>
              <Input
                id="splitAmount"
                type="number"
                placeholder="Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                min="0"
                max={remainingAmount}
                step="0.01"
              />
            </div>
            
            <div className="sm:col-span-1">
              <Button 
                className="w-full" 
                onClick={handleAddSplit}
                disabled={
                  !newAmount || 
                  isNaN(parseFloat(newAmount)) || 
                  parseFloat(newAmount) <= 0 || 
                  parseFloat(newAmount) > remainingAmount
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-4 flex justify-between">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {onComplete && (
          <Button 
            onClick={handleComplete}
            className="ml-auto"
            disabled={remainingAmount > 0 || (hasCreditPayment && !selectedCustomerId)}
          >
            Complete Payment
          </Button>
        )}
      </div>
    </div>
  );
};

export default POSSplitPayment;
