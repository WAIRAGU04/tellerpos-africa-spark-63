
import { toast } from "sonner";

export interface AppError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public retryable: boolean = false,
    public details?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string = 'Network error occurred',
    public retryable: boolean = true,
    public details?: string
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Error codes for consistent handling
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation errors
  INVALID_EMAIL: 'INVALID_EMAIL',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  PASSWORDS_DONT_MATCH: 'PASSWORDS_DONT_MATCH',
  INVALID_BUSINESS_ID: 'INVALID_BUSINESS_ID',
  
  // Business logic errors
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
  BUSINESS_NOT_FOUND: 'BUSINESS_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  
  // System errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again.',
  [ERROR_CODES.ACCOUNT_LOCKED]: 'Your account has been temporarily locked. Please contact support.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  
  [ERROR_CODES.INVALID_EMAIL]: 'Please enter a valid email address.',
  [ERROR_CODES.WEAK_PASSWORD]: 'Password does not meet security requirements.',
  [ERROR_CODES.PASSWORDS_DONT_MATCH]: 'Passwords do not match.',
  [ERROR_CODES.INVALID_BUSINESS_ID]: 'Invalid Business ID format.',
  
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ERROR_CODES.PHONE_ALREADY_EXISTS]: 'An account with this phone number already exists.',
  [ERROR_CODES.BUSINESS_NOT_FOUND]: 'Business not found.',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
} as const;

export class ErrorHandler {
  static handleError(error: unknown, context?: string): AppError {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    if (error instanceof AuthError) {
      return {
        code: error.code,
        message: ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message,
        details: error.details,
        retryable: error.retryable,
      };
    }
    
    if (error instanceof ValidationError) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
        retryable: false,
      };
    }
    
    if (error instanceof NetworkError) {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        details: error.details,
        retryable: error.retryable,
      };
    }
    
    // Handle generic errors
    if (error instanceof Error) {
      return {
        code: ERROR_CODES.UNKNOWN_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        details: error.message,
        retryable: true,
      };
    }
    
    // Handle unknown error types
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
      details: String(error),
      retryable: true,
    };
  }
  
  static showError(error: AppError, options?: {
    duration?: number;
    action?: { label: string; onClick: () => void };
  }) {
    toast.error(error.message, {
      description: error.details,
      duration: options?.duration || 5000,
      action: options?.action ? {
        label: options.action.label,
        onClick: options.action.onClick,
      } : undefined,
    });
  }
  
  static showRetryableError(
    error: AppError,
    retryFn: () => void,
    options?: { duration?: number }
  ) {
    if (error.retryable) {
      this.showError(error, {
        duration: options?.duration,
        action: {
          label: 'Retry',
          onClick: retryFn,
        },
      });
    } else {
      this.showError(error, options);
    }
  }
}

// Utility function for async error handling
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await asyncFn();
    return { data, error: null };
  } catch (error) {
    const appError = ErrorHandler.handleError(error, context);
    return { data: null, error: appError };
  }
};

// Hook for error handling in components
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    const appError = ErrorHandler.handleError(error, context);
    ErrorHandler.showError(appError);
    return appError;
  };
  
  const handleRetryableError = (error: unknown, retryFn: () => void, context?: string) => {
    const appError = ErrorHandler.handleError(error, context);
    ErrorHandler.showRetryableError(appError, retryFn);
    return appError;
  };
  
  return { handleError, handleRetryableError };
};

