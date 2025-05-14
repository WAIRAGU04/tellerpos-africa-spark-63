
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, WifiOff, RefreshCw } from 'lucide-react';

interface MpesaFailedStateProps {
  errorMessage: string;
  networkError: boolean;
  onRetry: () => void;
  onCancel: () => void;
  onManualCheck: () => void;
  checkoutRequestId: string | null;
  isOnline: boolean;
}

const MpesaFailedState: React.FC<MpesaFailedStateProps> = ({
  errorMessage,
  networkError,
  onRetry,
  onCancel,
  onManualCheck,
  checkoutRequestId,
  isOnline
}) => {
  return (
    <div className="text-center p-4 space-y-4">
      <XCircle className="h-16 w-16 mx-auto text-red-500" />
      <h3 className="text-xl font-medium">Payment Failed</h3>
      
      {networkError ? (
        <Alert variant="destructive" className="mt-4 text-left">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="text-sm">
            We couldn't connect to M-Pesa. This might be due to:
            <ul className="list-disc pl-5 mt-2">
              <li>Network connectivity issues</li>
              <li>M-Pesa service being unavailable</li>
            </ul>
            If money was deducted from your M-Pesa account, please check your M-Pesa statement.
          </AlertDescription>
        </Alert>
      ) : (
        <p className="text-red-500">{errorMessage || "Your payment could not be processed."}</p>
      )}
      
      <div className="flex space-x-2 mt-4 justify-center">
        <Button variant="outline" onClick={onCancel}>
          Back
        </Button>
        <Button onClick={onRetry} disabled={!isOnline}>
          Try Again
        </Button>
      </div>
      
      {checkoutRequestId && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Transaction Reference: {checkoutRequestId}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2"
            onClick={onManualCheck}
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default MpesaFailedState;
