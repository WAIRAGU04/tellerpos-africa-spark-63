
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Smartphone, RefreshCw } from 'lucide-react';

interface MpesaProcessingStateProps {
  status: 'processing' | 'checking';
  progress: number;
  checkCount: number;
  networkError: boolean;
  onManualCheck: () => void;
  onCancel: () => void;
  isOnline: boolean;
}

const MpesaProcessingState: React.FC<MpesaProcessingStateProps> = ({
  status,
  progress,
  checkCount,
  networkError,
  onManualCheck,
  onCancel,
  isOnline
}) => {
  return (
    <div className="text-center p-4 space-y-4">
      <Smartphone className="h-16 w-16 mx-auto text-tellerpos" />
      <h3 className="text-xl font-medium">Check your phone</h3>
      <p>Please enter your M-Pesa PIN when prompted</p>
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-muted-foreground">
        {status === 'processing' 
          ? "Sending payment request to your phone..." 
          : `Verifying payment status... (Check ${checkCount})`}
      </p>
      
      {networkError && (
        <Alert variant="warning" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Network Issue Detected</AlertTitle>
          <AlertDescription>
            We're having trouble connecting to M-Pesa. If you received a payment prompt, 
            please continue with the payment. We'll verify it once connection is restored.
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'checking' && checkCount >= 3 && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onManualCheck}
          disabled={!isOnline}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Manually Check Status
        </Button>
      )}
      
      <Button 
        variant="outline" 
        className="mt-4" 
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
};

export default MpesaProcessingState;
