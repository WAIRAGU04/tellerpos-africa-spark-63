
import React from 'react';
import { useMpesaPayment } from './mpesa/useMpesaPayment';
import MpesaPaymentForm from './mpesa/MpesaPaymentForm';
import MpesaProcessingState from './mpesa/MpesaProcessingState';
import MpesaSuccessState from './mpesa/MpesaSuccessState';
import MpesaFailedState from './mpesa/MpesaFailedState';

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
  const {
    status,
    progress,
    checkCount,
    networkError,
    errorMessage,
    isProcessing,
    checkoutRequestId,
    handleInitiatePayment,
    handleManualCheck
  } = useMpesaPayment({ amount, onSuccess, isOnline });

  // Render appropriate UI based on payment status
  const renderPaymentState = () => {
    switch (status) {
      case 'processing':
      case 'checking':
        return (
          <MpesaProcessingState
            status={status}
            progress={progress}
            checkCount={checkCount}
            networkError={networkError}
            onManualCheck={handleManualCheck}
            onCancel={onCancel}
            isOnline={isOnline}
          />
        );
      
      case 'success':
        return <MpesaSuccessState />;
      
      case 'failed':
        return (
          <MpesaFailedState
            errorMessage={errorMessage}
            networkError={networkError}
            onRetry={() => handleInitiatePayment("")} // Properly passed as function
            onCancel={onCancel}
            onManualCheck={handleManualCheck}
            checkoutRequestId={checkoutRequestId}
            isOnline={isOnline}
          />
        );
      
      case 'idle':
      default:
        return (
          <MpesaPaymentForm
            onInitiatePayment={handleInitiatePayment}
            onCancel={onCancel}
            isOnline={isOnline}
            amount={amount}
            isProcessing={isProcessing}
          />
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
