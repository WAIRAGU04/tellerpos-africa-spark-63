
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  initiateSTKPush, 
  querySTKStatus, 
  formatPhoneNumber 
} from '@/services/mpesaService';
import { nanoid } from 'nanoid';

interface UseMpesaPaymentProps {
  amount: number;
  onSuccess: (reference: string) => void;
  isOnline: boolean;
}

export function useMpesaPayment({ amount, onSuccess, isOnline }: UseMpesaPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'checking' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [networkError, setNetworkError] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const { toast } = useToast();

  // Function to poll payment status
  const checkPaymentStatus = useCallback(async (requestId: string) => {
    if (!isOnline) {
      setNetworkError(true);
      return;
    }
    
    setStatus('checking');
    let retries = 0;
    const maxRetries = 15; // Maximum number of retries
    const retryInterval = 4000; // 4 seconds between retries

    const checkStatus = async () => {
      try {
        console.log(`Checking payment status for request ID: ${requestId} (Attempt ${retries + 1})`);
        setCheckCount(prev => prev + 1);
        
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
          } else {
            setErrorMessage(response.error);
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
      
      // Cleanup function
      return () => {
        clearInterval(interval);
      };
    }, 5000); // Initial 5 second delay
  }, [onSuccess, toast, isOnline]);

  // Function to manually check payment status
  const handleManualCheck = async () => {
    if (!checkoutRequestId || !isOnline) return;
    
    try {
      setErrorMessage('');
      setNetworkError(false);
      
      // Increase progress to show activity
      setProgress(prev => Math.min(prev + 10, 90));
      
      const response = await querySTKStatus(checkoutRequestId);
      
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
        } else if (response.data.ResultCode) {
          // Payment failed with a result code
          setStatus('failed');
          setErrorMessage(response.data.ResultDesc || "Payment failed");
          toast({
            title: "Payment Failed",
            description: response.data.ResultDesc || "Payment failed",
            variant: "destructive"
          });
        }
      } else {
        // Still processing or another error
        toast({
          title: "Payment Status",
          description: "Still waiting for payment confirmation. Please try again in a moment."
        });
      }
    } catch (error) {
      console.error("Error manually checking payment status:", error);
      setNetworkError(true);
      toast({
        title: "Check Failed",
        description: "Could not check payment status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initiate STK Push
  const handleInitiatePayment = async (phoneNumber: string) => {
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
    setCheckCount(0);

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

  return {
    status,
    progress,
    checkCount,
    networkError,
    errorMessage,
    isProcessing,
    checkoutRequestId,
    handleInitiatePayment,
    handleManualCheck
  };
}
