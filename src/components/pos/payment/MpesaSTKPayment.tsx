
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateSTKPush, 
  querySTKStatus, 
  formatPhoneNumber 
} from '@/services/mpesaService';
import { nanoid } from 'nanoid';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, Smartphone, ArrowLeft, WifiOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MpesaSTKPaymentProps {
  amount: number;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
  isOnline: boolean;
}

const MpesaSTKPayment: React.FC<MpesaSTKPaymentProps> = ({
  amount,
  onSuccess,
  onCancel,
  isOnline
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'checking' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const { toast } = useToast();

  // Function to poll payment status
  const checkPaymentStatus = useCallback(async (requestId: string) => {
    setStatus('checking');
    let retries = 0;
    const maxRetries = 15; // Increase max retries for real API
    const retryInterval = 4000; // 4 seconds between retries

    const checkStatus = async () => {
      try {
        console.log(`Checking payment status for request ID: ${requestId}`);
        const response = await querySTKStatus(requestId);
        console.log("Payment status response:", response);
        
        // Clear any previous network errors
        setNetworkError(false);
        
        if (response.success && response.data) {
          if (response.data.ResultCode === "0") {
            // Payment successful
            setStatus('success');
            setProgress(100);
            toast({
              title: "Payment Successful",
              description: "Your M-Pesa payment has been processed successfully."
            });
            // Generate a reference for the transaction
            const reference = `MPESA-${nanoid(8).toUpperCase()}`;
            onSuccess(reference);
            return true;
          } else if (response.data.ResultCode) {
            // Payment failed with a result code
            setStatus('failed');
            setErrorMessage(response.data.ResultDesc || "Payment failed");
            toast({
              title: "Payment Failed",
              description: response.data.ResultDesc || "Payment failed",
              variant: "destructive"
            });
            return true;
          }
        } else if (response.error) {
          // If there's a specific error message from the API, show it
          console.error("Error checking payment:", response.error);
          
          // Check if it might be a CORS/network error
          if (response.error.includes("Failed to fetch") || 
              response.error.includes("NetworkError") ||
              response.error.includes("CORS")) {
            setNetworkError(true);
          }
        }
        
        // If we haven't reached max retries, continue polling
        if (retries < maxRetries) {
          retries++;
          setProgress(Math.round((retries / maxRetries) * 80) + 10);
          return false;
        } else {
          // Max retries reached, assume timeout
          setStatus('failed');
          setErrorMessage("Payment verification timed out. If money was deducted, please contact support.");
          toast({
            title: "Verification Timeout",
            description: "Could not verify payment status. Please check your M-Pesa app.",
            variant: "destructive"
          });
          return true;
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        
        // Mark as network error for better UX
        setNetworkError(true);
        
        if (retries < maxRetries) {
          retries++;
          setProgress(Math.round((retries / maxRetries) * 80) + 10);
          return false;
        }
        setStatus('failed');
        setErrorMessage("Failed to verify payment. Please check your M-Pesa app.");
        return true;
      }
    };

    // Initial poll with a slight delay to let the STK push be processed
    setTimeout(async () => {
      const finished = await checkStatus();
      if (finished) return;

      // Continue polling every retryInterval seconds
      const interval = setInterval(async () => {
        const finished = await checkStatus();
        if (finished) {
          clearInterval(interval);
        }
      }, retryInterval);
    }, 5000); // Initial 5 second delay

    // Cleanup function
    return () => {};
  }, [onSuccess, toast]);

  // Initiate STK Push
  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    if (!isOnline) {
      toast({
        title: "Offline Mode",
        description: "M-Pesa payments require an internet connection",
        variant: "destructive"
      });
      return;
    }

    // Reset states
    setIsProcessing(true);
    setStatus('processing');
    setProgress(10);
    setErrorMessage('');
    setNetworkError(false);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log(`Initiating STK Push to phone number: ${formattedPhone}`);
      
      const response = await initiateSTKPush({
        phoneNumber: formattedPhone,
        amount,
        accountReference: `TellerPOS-${nanoid(6)}`,
        transactionDesc: "Purchase at TellerPOS"
      });

      console.log("STK Push response:", response);

      if (response.success && response.data) {
        setCheckoutRequestId(response.data.CheckoutRequestID);
        toast({
          title: "STK Push Sent",
          description: "Please check your phone and enter your M-Pesa PIN"
        });
        
        // Start checking status
        checkPaymentStatus(response.data.CheckoutRequestID);
      } else {
        setStatus('failed');
        
        // Set a more specific error message
        const errorMsg = response.error || "Failed to initiate payment";
        setErrorMessage(errorMsg);
        
        // Check if it might be a CORS/network error
        if (errorMsg.includes("Failed to fetch") || 
            errorMsg.includes("NetworkError") ||
            errorMsg.includes("CORS")) {
          setNetworkError(true);
        }
        
        toast({
          title: "Payment Failed",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setStatus('failed');
      setErrorMessage("An unexpected error occurred");
      setNetworkError(true);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      setStatus('idle');
      setProgress(0);
      setErrorMessage('');
      setNetworkError(false);
    };
  }, []);

  // Different UI states based on payment status
  const renderPaymentState = () => {
    switch (status) {
      case 'processing':
      case 'checking':
        return (
          <div className="text-center p-4 space-y-4">
            <Smartphone className="h-16 w-16 mx-auto text-tellerpos" />
            <h3 className="text-xl font-medium">Check your phone</h3>
            <p>Please enter your M-Pesa PIN when prompted</p>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {status === 'processing' 
                ? "Sending payment request to your phone..." 
                : "Verifying payment status..."}
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
            
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center p-4 space-y-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h3 className="text-xl font-medium">Payment Successful!</h3>
            <p>Your M-Pesa payment has been processed successfully.</p>
            <Progress value={100} className="w-full bg-green-100" />
          </div>
        );
      
      case 'failed':
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
              <Button onClick={handleInitiatePayment} disabled={!isOnline}>
                Try Again
              </Button>
            </div>
          </div>
        );
      
      case 'idle':
      default:
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">M-Pesa STK Push</h3>
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
                className="w-full"
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Enter your phone number in format 07XX XXX XXX
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full"
                onClick={handleInitiatePayment}
                disabled={!phoneNumber.trim() || !isOnline || isProcessing}
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
    }
  };

  return (
    <div className="p-4">
      {renderPaymentState()}
    </div>
  );
};

export default MpesaSTKPayment;
