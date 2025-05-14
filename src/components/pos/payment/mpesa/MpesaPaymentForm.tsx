
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { validatePhoneNumber } from '@/services/mpesaService';

interface MpesaPaymentFormProps {
  onInitiatePayment: (phoneNumber: string) => void;
  onCancel: () => void;
  isOnline: boolean;
  amount: number;
  isProcessing: boolean;
}

const MpesaPaymentForm: React.FC<MpesaPaymentFormProps> = ({
  onInitiatePayment,
  onCancel,
  isOnline,
  amount,
  isProcessing
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Clear validation errors when user starts typing again
  useEffect(() => {
    if (phoneError && phoneNumber) {
      setPhoneError('');
    }
  }, [phoneNumber, phoneError]);

  const handleSubmit = () => {
    // Validate phone number before submission
    try {
      if (!phoneNumber.trim()) {
        setPhoneError('Phone number is required');
        return;
      }
      
      // Basic validation - can be enhanced further
      if (phoneNumber.length < 9) {
        setPhoneError('Phone number is too short');
        return;
      }

      // If validation passes, initiate payment
      onInitiatePayment(phoneNumber);
    } catch (error) {
      setPhoneError('Invalid phone number format');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">M-Pesa STK Push</h3>
        <p className="text-sm text-muted-foreground">
          Enter your M-Pesa phone number to receive a payment prompt.
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="phone-number" className="text-sm font-medium">
          Phone Number
        </label>
        <Input
          id="phone-number"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g., 0712345678"
          className={`w-full ${phoneError ? 'border-red-500' : ''}`}
          disabled={isProcessing}
        />
        {phoneError && (
          <p className="text-xs text-red-500 mt-1">
            {phoneError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter your phone number in format 07XX XXX XXX
        </p>
      </div>
      
      <div className="pt-4">
        <Button 
          className="w-full"
          onClick={handleSubmit}
          disabled={!isOnline || isProcessing}
        >
          Pay KES {amount.toLocaleString()}
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full mt-2" 
          onClick={onCancel}
          disabled={isProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
      
      {!isOnline && (
        <div className="p-2 bg-amber-50 text-amber-800 rounded-md flex items-center mt-2">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p className="text-sm">
            M-Pesa payments require an internet connection.
          </p>
        </div>
      )}
    </div>
  );
};

export default MpesaPaymentForm;
