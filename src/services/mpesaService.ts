
/**
 * M-Pesa Integration Service
 * Handles interactions with the M-Pesa API for Lipa na M-Pesa Online (STK Push)
 */
import { toast } from "@/hooks/use-toast";
import { cacheData, getCachedData } from "./offlineService";

// Define MpesaTransaction type to fix TypeScript errors
export interface MpesaTransaction {
  checkoutRequestId: string;
  merchantRequestId: string;
  amount: number;
  phoneNumber: string;
  accountReference: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

// Constants for M-Pesa integration
const MPESA_API_ENDPOINT = {
  authToken: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
  stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  stkQuery: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
};

// Production endpoints (uncomment when moving to production)
// const MPESA_API_ENDPOINT = {
//   authToken: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
//   stkPush: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
//   stkQuery: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
// };

// Real test credentials
const DEFAULT_CREDENTIALS = {
  businessShortCode: "174379",
  passKey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  consumerKey: "rWtc2eFAjom4PlAszBn98mlOOqTC33bSAtLp7fRLSw0yE8k7",
  consumerSecret: "HF9qo7n9AbomCjcFhAjiOAHkfCwKSlmfxA7vbPRk6usrhqEIf2iuQcELWXBpyHmB",
  initiatorName: "testapi",
  initiatorPassword: "Safaricom123!!",
  partyA: "600984",
  partyB: "600000",
  callbackUrl: "https://mydomain.com/callback", // Would be replaced in production
  transactionType: "CustomerPayBillOnline"
};

// Token cache
let oauthToken: string | null = null;
let tokenExpiry: number | null = null;

// Types for M-Pesa API
export interface MpesaCredentials {
  businessShortCode: string;
  passKey: string;
  consumerKey: string;
  consumerSecret: string;
  initiatorName: string;
  initiatorPassword: string;
  partyA: string;
  partyB: string;
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
const ACCESS_TOKEN_KEY = "mpesa_access_token";
const TOKEN_EXPIRY_KEY = "mpesa_token_expiry";

/**
 * Generate the password for M-Pesa API authentication
 * Format: Base64(BusinessShortCode + PassKey + Timestamp)
 */
export const generatePassword = (businessShortCode: string, passKey: string, timestamp: string): string => {
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
 * Get M-Pesa credentials from localStorage or use defaults
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
 * Get OAuth access token for M-Pesa API authentication
 * Tokens are valid for 1 hour
 */
export const getAccessToken = async (): Promise<string> => {
  // Check if we have a cached token that hasn't expired
  const currentTime = Date.now();
  
  // Try to get from memory first
  if (oauthToken && tokenExpiry && currentTime < tokenExpiry) {
    return oauthToken;
  }
  
  // Try to get from localStorage next
  const cachedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const cachedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (cachedToken && cachedExpiry && currentTime < parseInt(cachedExpiry)) {
    oauthToken = cachedToken;
    tokenExpiry = parseInt(cachedExpiry);
    return cachedToken;
  }

  // If no valid token found, get a new one
  const credentials = getMpesaCredentials();
  
  try {
    const auth = btoa(`${credentials.consumerKey}:${credentials.consumerSecret}`);
    
    const response = await fetch(MPESA_API_ENDPOINT.authToken, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token received');
    }
    
    // Cache the token (valid for 1 hour)
    oauthToken = data.access_token;
    tokenExpiry = currentTime + (data.expires_in * 1000 || 3600000); // Default to 1 hour if not specified
    
    // Store in localStorage as backup
    localStorage.setItem(ACCESS_TOKEN_KEY, oauthToken);
    localStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiry.toString());
    
    return data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

/**
 * Initiate STK Push request to M-Pesa API
 */
export const initiateSTKPush = async (
  requestData: STKPushRequest
): Promise<{ success: boolean; data?: STKPushResponse; error?: string }> => {
  try {
    // Check if online
    if (!navigator.onLine) {
      return { success: false, error: "No internet connection" };
    }
    
    const credentials = getMpesaCredentials();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      credentials.businessShortCode,
      credentials.passKey,
      timestamp
    );
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Prepare request body
    const requestBody = {
      BusinessShortCode: credentials.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: credentials.transactionType,
      Amount: requestData.amount.toString(),
      PartyA: requestData.phoneNumber,
      PartyB: credentials.businessShortCode,
      PhoneNumber: requestData.phoneNumber,
      CallBackURL: credentials.callbackUrl,
      AccountReference: requestData.accountReference,
      TransactionDesc: requestData.transactionDesc
    };
    
    console.log("STK Push request:", requestBody);
    
    // Make API call
    const response = await fetch(MPESA_API_ENDPOINT.stkPush, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    console.log("STK Push response:", responseData);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: responseData.errorMessage || `HTTP error! Status: ${response.status}` 
      };
    }
    
    // Store pending transaction for checking status later
    if (responseData.ResponseCode === "0") {
      const pendingTransactions = getPendingTransactions();
      const newTransaction: MpesaTransaction = {
        checkoutRequestId: responseData.CheckoutRequestID,
        merchantRequestId: responseData.MerchantRequestID,
        amount: requestData.amount,
        phoneNumber: requestData.phoneNumber,
        accountReference: requestData.accountReference,
        timestamp: new Date().toISOString(),
        status: "pending"
      };
      
      pendingTransactions.push(newTransaction);
      savePendingTransactions(pendingTransactions);
    }

    return { 
      success: responseData.ResponseCode === "0", 
      data: responseData,
      error: responseData.ResponseCode !== "0" ? responseData.ResponseDescription : undefined
    };
  } catch (error) {
    console.error("Error initiating STK push:", error);
    return { success: false, error: "Failed to initiate payment" };
  }
};

/**
 * Query STK Push status from M-Pesa API
 */
export const querySTKStatus = async (
  checkoutRequestId: string
): Promise<{ success: boolean; data?: STKQueryResponse; error?: string }> => {
  try {
    // Check if online
    if (!navigator.onLine) {
      return { success: false, error: "No internet connection" };
    }
    
    const credentials = getMpesaCredentials();
    const timestamp = generateTimestamp();
    const password = generatePassword(
      credentials.businessShortCode,
      credentials.passKey,
      timestamp
    );
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Prepare request body
    const requestBody = {
      BusinessShortCode: credentials.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };
    
    console.log("STK Query request:", requestBody);
    
    // Make API call
    const response = await fetch(MPESA_API_ENDPOINT.stkQuery, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    const responseData = await response.json();
    console.log("STK Query response:", responseData);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: responseData.errorMessage || `HTTP error! Status: ${response.status}` 
      };
    }
    
    // Update transaction status based on response
    if (responseData.ResponseCode === "0") {
      const resultCode = responseData.ResultCode;
      const newStatus: "completed" | "failed" = resultCode === "0" ? "completed" : "failed";
      updateTransactionStatus(checkoutRequestId, newStatus);
    }

    return { 
      success: responseData.ResponseCode === "0", 
      data: responseData,
      error: responseData.ResponseCode !== "0" ? responseData.ResponseDescription : undefined
    };
  } catch (error) {
    console.error("Error querying STK status:", error);
    return { success: false, error: "Failed to check payment status" };
  }
};

/**
 * Get all pending M-Pesa transactions
 */
export const getPendingTransactions = (): MpesaTransaction[] => {
  const storedTransactions = localStorage.getItem(PENDING_MPESA_TRANSACTIONS);
  return storedTransactions ? JSON.parse(storedTransactions) : [];
};

/**
 * Save pending M-Pesa transactions
 */
export const savePendingTransactions = (transactions: MpesaTransaction[]): void => {
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
      ? transaction.status as "completed" | "pending" | "failed"
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
