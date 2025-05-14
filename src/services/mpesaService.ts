
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
// Add CORS proxy prefix for development environment
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
// const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// Development mode toggle - set to false for production
const IS_DEVELOPMENT = true;

// Base endpoints (will be prefixed with proxy in dev mode)
const BASE_MPESA_ENDPOINTS = {
  authToken: "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
  stkPush: "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  stkQuery: "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query"
};

// Production endpoints (uncomment when moving to production)
// const BASE_MPESA_ENDPOINTS = {
//   authToken: "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
//   stkPush: "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
//   stkQuery: "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
// };

// Properly format endpoints with CORS proxy in development mode
const MPESA_API_ENDPOINT = {
  authToken: IS_DEVELOPMENT ? `${CORS_PROXY}${BASE_MPESA_ENDPOINTS.authToken}` : BASE_MPESA_ENDPOINTS.authToken,
  stkPush: IS_DEVELOPMENT ? `${CORS_PROXY}${BASE_MPESA_ENDPOINTS.stkPush}` : BASE_MPESA_ENDPOINTS.stkPush,
  stkQuery: IS_DEVELOPMENT ? `${CORS_PROXY}${BASE_MPESA_ENDPOINTS.stkQuery}` : BASE_MPESA_ENDPOINTS.stkQuery
};

// Test credentials provided
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

// Mock responses for development mode
const MOCK_RESPONSES = {
  stkPush: {
    MerchantRequestID: "mock-merchant-request-id",
    CheckoutRequestID: "mock-checkout-request-id",
    ResponseCode: "0",
    ResponseDescription: "Success. Request accepted for processing",
    CustomerMessage: "Success. Request accepted for processing"
  },
  stkQuery: {
    ResponseCode: "0",
    ResponseDescription: "Success",
    MerchantRequestID: "mock-merchant-request-id",
    CheckoutRequestID: "mock-checkout-request-id",
    ResultCode: "0",
    ResultDesc: "The service request is processed successfully."
  }
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

// Cache keys
const PENDING_MPESA_TRANSACTIONS = "pending_mpesa_transactions";
const ACCESS_TOKEN_KEY = "mpesa_access_token";
const TOKEN_EXPIRY_KEY = "mpesa_token_expiry";

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
  // For development mode with no internet connection, return a mock token
  if (IS_DEVELOPMENT && !navigator.onLine) {
    console.log("Development mode with no internet: Returning mock access token");
    return "mock-dev-access-token-for-testing";
  }

  // Check if we have a cached token that hasn't expired
  const currentTime = Date.now();
  
  // Try to get from memory first
  if (oauthToken && tokenExpiry && currentTime < tokenExpiry) {
    console.log("Using cached token from memory");
    return oauthToken;
  }
  
  // Try to get from localStorage next
  const cachedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const cachedExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (cachedToken && cachedExpiry && currentTime < parseInt(cachedExpiry)) {
    console.log("Using cached token from localStorage");
    oauthToken = cachedToken;
    tokenExpiry = parseInt(cachedExpiry);
    return cachedToken;
  }

  // If no valid token found, get a new one
  const credentials = getMpesaCredentials();
  
  try {
    console.log("Fetching new M-Pesa access token...");
    
    const auth = btoa(`${credentials.consumerKey}:${credentials.consumerSecret}`);
    
    const response = await fetch(MPESA_API_ENDPOINT.authToken, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Origin': window.location.origin
      }
    });
    
    if (!response.ok) {
      console.error(`HTTP error getting token! Status: ${response.status}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Token response:", data);
    
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
    
    if (IS_DEVELOPMENT) {
      // In development mode, return a mock token on error
      console.log("Returning mock token after error in development mode");
      return "mock-dev-access-token-after-error";
    }
    
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
      console.error("No internet connection available for STK Push");
      return { success: false, error: "No internet connection" };
    }
    
    // Use mock response in development mode without hitting API
    if (IS_DEVELOPMENT && false) { // Set to true to force mock responses
      console.log("Development mode: Using mock STK Push response");
      console.log("Mock STK Push request:", requestData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store pending transaction with mock data
      const pendingTransactions = getPendingTransactions();
      const newTransaction: MpesaTransaction = {
        checkoutRequestId: MOCK_RESPONSES.stkPush.CheckoutRequestID,
        merchantRequestId: MOCK_RESPONSES.stkPush.MerchantRequestID,
        amount: requestData.amount,
        phoneNumber: requestData.phoneNumber,
        accountReference: requestData.accountReference,
        timestamp: new Date().toISOString(),
        status: "pending"
      };
      
      pendingTransactions.push(newTransaction);
      savePendingTransactions(pendingTransactions);
      
      return { 
        success: true, 
        data: MOCK_RESPONSES.stkPush
      };
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
    console.log(`Using access token: ${accessToken.substring(0, 15)}...`);
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(requestData.phoneNumber);
    console.log(`Formatted phone number: ${formattedPhone}`);
    
    // Prepare request body
    const requestBody = {
      BusinessShortCode: credentials.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: credentials.transactionType,
      Amount: requestData.amount.toString(),
      PartyA: formattedPhone,
      PartyB: credentials.businessShortCode,
      PhoneNumber: formattedPhone,
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
        'Authorization': `Bearer ${accessToken}`,
        'Origin': window.location.origin
      },
      body: JSON.stringify(requestBody)
    });
    
    // Log complete response for debugging
    const responseText = await response.text();
    console.log("STK Push raw response:", responseText);
    
    // Parse the response if it looks like JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return { 
        success: false, 
        error: `Invalid response format: ${responseText}`
      };
    }
    
    console.log("STK Push parsed response:", responseData);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`, responseData);
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
      console.log("Saved pending transaction:", newTransaction);
    }

    return { 
      success: responseData.ResponseCode === "0", 
      data: responseData,
      error: responseData.ResponseCode !== "0" ? responseData.ResponseDescription : undefined
    };
  } catch (error) {
    console.error("Error initiating STK push:", error);
    return { 
      success: false, 
      error: `Failed to initiate payment: ${error.message}. Check console for details.` 
    };
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
      console.error("No internet connection available for STK Query");
      return { success: false, error: "No internet connection" };
    }
    
    // Use mock response in development mode without hitting API
    if (IS_DEVELOPMENT && false) { // Set to true to force mock responses
      console.log("Development mode: Using mock STK Query response");
      console.log("Mock STK Query for CheckoutRequestID:", checkoutRequestId);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update transaction status to completed
      updateTransactionStatus(checkoutRequestId, "completed");
      
      return { 
        success: true, 
        data: MOCK_RESPONSES.stkQuery
      };
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
    console.log(`Using access token for query: ${accessToken.substring(0, 15)}...`);
    
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
        'Authorization': `Bearer ${accessToken}`,
        'Origin': window.location.origin
      },
      body: JSON.stringify(requestBody)
    });
    
    // Log complete response for debugging
    const responseText = await response.text();
    console.log("STK Query raw response:", responseText);
    
    // Parse the response if it looks like JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", e);
      return { 
        success: false, 
        error: `Invalid response format: ${responseText}`
      };
    }
    
    console.log("STK Query parsed response:", responseData);
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`, responseData);
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
      console.log(`Updated transaction status to ${newStatus}`);
    }

    return { 
      success: responseData.ResponseCode === "0", 
      data: responseData,
      error: responseData.ResponseCode !== "0" ? responseData.ResponseDescription : undefined
    };
  } catch (error) {
    console.error("Error querying STK status:", error);
    return { 
      success: false, 
      error: `Failed to check payment status: ${error.message}. Check console for details.` 
    };
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
    try {
      console.log(`Reconciling transaction: ${tx.checkoutRequestId}`);
      await querySTKStatus(tx.checkoutRequestId);
    } catch (error) {
      console.error(`Failed to reconcile transaction ${tx.checkoutRequestId}:`, error);
    }
  }
  
  toast({
    title: "Reconciliation complete",
    description: "All pending M-Pesa transactions have been updated"
  });
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
