
import React from 'react';
import { Button } from '@/components/ui/button';
import { PaymentMethod } from '@/types/pos';
import { BanknoteIcon, SmartphoneIcon, CreditCard } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  isCustomerSelected: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  isCustomerSelected
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      <Button 
        onClick={() => onSelectMethod('cash')}
        variant={selectedMethod === 'cash' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <BanknoteIcon className="h-6 w-6 mb-2" />
        Cash
      </Button>
      <Button 
        onClick={() => onSelectMethod('mpesa-stk')}
        variant={selectedMethod === 'mpesa-stk' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <SmartphoneIcon className="h-6 w-6 mb-2" />
        M-Pesa STK
      </Button>
      <Button 
        onClick={() => onSelectMethod('mpesa-till')}
        variant={selectedMethod === 'mpesa-till' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <SmartphoneIcon className="h-6 w-6 mb-2" />
        M-Pesa Till
      </Button>
      <Button 
        onClick={() => onSelectMethod('pochi-la-biashara')}
        variant={selectedMethod === 'pochi-la-biashara' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <SmartphoneIcon className="h-6 w-6 mb-2" />
        Pochi La Biashara
      </Button>
      <Button 
        onClick={() => onSelectMethod('bank-transfer')}
        variant={selectedMethod === 'bank-transfer' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center"
      >
        <CreditCard className="h-6 w-6 mb-2" />
        Bank Transfer
      </Button>
      <Button 
        onClick={() => onSelectMethod('credit')}
        variant={selectedMethod === 'credit' ? 'default' : 'outline'}
        className="h-20 flex flex-col items-center justify-center disabled:opacity-50"
        disabled={!isCustomerSelected}
      >
        <CreditCard className="h-6 w-6 mb-2" />
        Customer Credit
      </Button>
    </div>
  );
};

export default PaymentMethodSelector;
