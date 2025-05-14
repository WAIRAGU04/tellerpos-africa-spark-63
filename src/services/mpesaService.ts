/**
 * M-Pesa Integration Service
 * Handles interactions with the M-Pesa API for Lipa na M-Pesa Online (STK Push)
 */
import { toast } from "@/hooks/use-toast";
import { cacheData, getCachedData } from "./offlineService";

// Constants for M-Pesa integration
const MPESA_API_ENDPOINT = {
  stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  stkQuery: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
};

// Default test credentials
const DEFAULT_CREDENTIALS = {
  businessShortCode: "174379",
  passKey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  consumerKey: "your-consumer-key", // These would be replaced with actual keys
  consumerSecret: "your-consumer-secret", // These would be replaced with actual keys
  callbackUrl: "https://example.com/callback", // This would be replaced in a real implementation
  transactionType: "CustomerPayBillOnline"
};

// Types for M-Pesa API
export interface MpesaCredentials {
  businessShortCode: string;
  passKey: string;
  consumerKey: string;
  consumerSecret: string;
  callbackUrl: string;
  transactionType: string;
}

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage?: string;
}

export interface STKQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

// Pending transactions cache key
const PENDING_MPESA_TRANSACTIONS = "pending_mpesa_transactions";

/**
 * Generate the password for M-Pesa API authentication
 * Format: Base64(BusinessShortCode + PassKey + Timestamp)
 */
export const generatePassword = (businessShortCode: string, passKey: string, timestamp: string): string => {
  // In a browser environment, we'd use btoa for Base64 encoding
  try {
    return btoa(`${businessShortCode}${passKey}${timestamp}`);
  } catch (error) {
    console.error("Error generating password:", error);
    return "";
  }
};

/**
 * Generate timestamp in the format required by M-Pesa API (YYYYMMDDHHmmss)
 */
export const generateTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Get M-Pesa credentials from localStorage or use defaults (for demo/development)
 */
export const getMpesaCredentials = (): MpesaCredentials => {
  const storedCredentials = localStorage.getItem("mpesa_credentials");
  return storedCredentials ? JSON.parse(storedCredentials) : DEFAULT_CREDENTIALS;
};

/**
 * Save M-Pesa credentials to localStorage
 */
export const saveMpesaCredentials = (credentials: MpesaCredentials): void => {
  localStorage.setItem("mpesa_credentials", JSON.stringify(credentials));
};

/**
 * Initiate STK Push request
 * This would normally call the M-Pesa API, but for demo purposes it simulates the response
 */
export const initiateSTKPush = async (
  requestData: STKPushRequest
): Promise<{ success: boolean; data?: STKPushResponse; error?: string }> => {
  try {
    const credentials = getMpesaCredentials();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      credentials.businessShortCode,
      credentials.passKey,
      timestamp
    );

    // In a real implementation, this would be an actual API call
    // For demonstration, we'll simulate a response based on test data
    const simulatedResponse: STKPushResponse = {
      MerchantRequestID: `merc-${Math.random().toString(36).substring(2, 10)}`,
      CheckoutRequestID: `ws_CO_${timestamp}_${Math.random().toString(36).substring(2, 10)}`,
      ResponseCode: "0",
      ResponseDescription: "Success. Request accepted for processing",
      CustomerMessage: "Success. Request accepted for processing"
    };

    // Store pending transaction in localStorage for checking status later
    const pendingTransactions = getPendingTransactions();
    const newTransaction = {
      checkoutRequestId: simulatedResponse.CheckoutRequestID,
      merchantRequestId: simulatedResponse.MerchantRequestID,
      amount: requestData.amount,
      phoneNumber: requestData.phoneNumber,
      accountReference: requestData.accountReference,
      timestamp: new Date().toISOString(),
      status: "pending"
    };
    
    pendingTransactions.push(newTransaction);
    savePendingTransactions(pendingTransactions);

    return { success: true, data: simulatedResponse };
  } catch (error) {
    console.error("Error initiating STK push:", error);
    return { success: false, error: "Failed to initiate payment" };
  }
};

/**
 * Query STK Push status
 * This would normally call the M-Pesa API query endpoint, but for demo purposes it simulates the response
 */
export const querySTKStatus = async (
  checkoutRequestId: string
): Promise<{ success: boolean; data?: STKQueryResponse; error?: string }> => {
  try {
    const credentials = getMpesaCredentials();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      credentials.businessShortCode,
      credentials.passKey,
      timestamp
    );

    // In a real implementation, this would be an actual API call
    // For demonstration, we'll simulate a response
    // Let's simulate different responses based on the checkoutRequestId
    // to demonstrate different scenarios
    
    // Find the pending transaction
    const pendingTransactions = getPendingTransactions();
    const transaction = pendingTransactions.find(tx => tx.checkoutRequestId === checkoutRequestId);
    
    if (!transaction) {
      return {
        success: false,
        error: "Transaction not found"
      };
    }

    // For demo purposes, we'll randomly determine success or failure
    // In a real app, this would come from the actual API response
    const isSuccess = Math.random() > 0.3; // 70% success rate for demo

    const simulatedResponse: STKQueryResponse = {
      ResponseCode: "0",
      ResponseDescription: "The service request has been accepted successfully",
      MerchantRequestID: transaction.merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      ResultCode: isSuccess ? "0" : "1032",
      ResultDesc: isSuccess 
        ? "The service request is processed successfully."
        : "Request cancelled by user"
    };

    // Update the status of the pending transaction
    if (isSuccess) {
      updateTransactionStatus(checkoutRequestId, "completed");
    } else {
      updateTransactionStatus(checkoutRequestId, "failed");
    }

    return { success: true, data: simulatedResponse };
  } catch (error) {
    console.error("Error querying STK status:", error);
    return { success: false, error: "Failed to check payment status" };
  }
};

/**
 * Get all pending M-Pesa transactions
 */
export const getPendingTransactions = (): Array<{
  checkoutRequestId: string;
  merchantRequestId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}> => {
  const storedTransactions = localStorage.getItem(PENDING_MPESA_TRANSACTIONS);
  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

/**
 * Save pending M-Pesa transactions
 */
export const savePendingTransactions = (transactions: Array<any>): void => {
  localStorage.setItem(PENDING_MPESA_TRANSACTIONS, JSON.stringify(transactions));
  
  // Also cache for offline access
  cacheData(PENDING_MPESA_TRANSACTIONS, transactions);
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = (
  checkoutRequestId: string,
  status: "pending" | "completed" | "failed"
): void => {
  const pendingTransactions = getPendingTransactions();
  const updatedTransactions = pendingTransactions.map(tx => {
    if (tx.checkoutRequestId === checkoutRequestId) {
      return { ...tx, status };
    }
    return tx;
  });
  
  savePendingTransactions(updatedTransactions);
};

/**
 * Check pending transactions and reconcile them
 * This would be called when coming back online
 */
export const reconcilePendingTransactions = async (): Promise<void> => {
  const pendingTransactions = getPendingTransactions();
  const pendingOnly = pendingTransactions.filter(tx => tx.status === "pending");
  
  if (pendingOnly.length === 0) return;
  
  toast({
    title: "Checking pending M-Pesa payments",
    description: `Reconciling ${pendingOnly.length} pending transactions`
  });
  
  // In a real app, we would query each transaction
  // For demo, we'll just simulate completion after a delay
  for (const tx of pendingOnly) {
    await querySTKStatus(tx.checkoutRequestId);
  }
  
  toast({
    title: "Reconciliation complete",
    description: "All pending M-Pesa transactions have been updated"
  });
};

/**
 * Format phone number to international format (254XXXXXXXXX)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if the number starts with '0' (Kenyan format)
  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    // Replace the leading '0' with '254'
    return `254${digitsOnly.substring(1)}`;
  }
  
  // Check if the number starts with '7' or '1' (without country code)
  if ((digitsOnly.startsWith('7') || digitsOnly.startsWith('1')) && digitsOnly.length === 9) {
    // Add '254' prefix
    return `254${digitsOnly}`;
  }
  
  // If it already has the country code
  if (digitsOnly.startsWith('254') && digitsOnly.length === 12) {
    return digitsOnly;
  }
  
  // If none of the above patterns match, return as is
  return digitsOnly;
};

/**
 * Update M-Pesa transaction status
 */
export const updateMpesaTransaction = (transaction: Omit<MpesaTransaction, "status"> & { status: string }) => {
  // Convert the string status to the enum type
  const typedStatus: "completed" | "pending" | "failed" = 
    transaction.status === "completed" || 
    transaction.status === "pending" || 
    transaction.status === "failed" 
      ? transaction.status 
      : "failed";
  
  const typedTransaction: MpesaTransaction = {
    ...transaction,
    status: typedStatus
  };
  
  // Rest of the function implementation
  const storedTransactions = localStorage.getItem('mpesaTransactions');
  let transactions: MpesaTransaction[] = storedTransactions ? JSON.parse(storedTransactions) : [];
  
  // Update the transaction if it exists, otherwise add it
  const index = transactions.findIndex(t => t.checkoutRequestId === typedTransaction.checkoutRequestId);
  
  if (index !== -1) {
    transactions[index] = typedTransaction;
  } else {
    transactions.push(typedTransaction);
  }
  
  localStorage.setItem('mpesaTransactions', JSON.stringify(transactions));
  return typedTransaction;
};
