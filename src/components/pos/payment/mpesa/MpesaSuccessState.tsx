
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

const MpesaSuccessState: React.FC = () => {
  return (
    <div className="text-center p-4 space-y-4">
      <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
      <h3 className="text-xl font-medium">Payment Successful!</h3>
      <p>Your M-Pesa payment has been processed successfully.</p>
      <Progress value={100} className="w-full bg-green-100" />
    </div>
  );
};

export default MpesaSuccessState;
