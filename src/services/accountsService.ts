
import { Account, AccountTransaction, AccountTransfer } from '@/types/accounts';
import { PaymentMethod } from '@/types/pos';
import { nanoid } from 'nanoid';

// Initialize accounts if they don't exist
export const initializeAccounts = () => {
  const storedAccounts = localStorage.getItem('accounts');
  
  if (!storedAccounts) {
    const defaultAccounts: Account[] = [
      { id: '1', name: 'Cash', type: 'cash', balance: 0, lastUpdated: new Date().toISOString() },
      { id: '2', name: 'M-PESA STK', type: 'mpesa-stk', balance: 0, lastUpdated: new Date().toISOString() },
      { id: '3', name: 'M-PESA Till', type: 'mpesa-till', balance: 0, lastUpdated: new Date().toISOString() },
      { id: '4', name: 'Pochi La Biashara', type: 'pochi-la-biashara', balance: 0, lastUpdated: new Date().toISOString() },
      { id: '5', name: 'Bank Transfer', type: 'bank-transfer', balance: 0, lastUpdated: new Date().toISOString() },
      { id: '6', name: 'Credit', type: 'credit', balance: 0, lastUpdated: new Date().toISOString() },
    ];
    
    localStorage.setItem('accounts', JSON.stringify(defaultAccounts));
    return defaultAccounts;
  }
  
  return JSON.parse(storedAccounts);
};

// Get all accounts
export const getAccounts = (): Account[] => {
  const accounts = localStorage.getItem('accounts');
  return accounts ? JSON.parse(accounts) : initializeAccounts();
};

// Update account balances based on payment method
export const updateAccountBalance = (paymentMethod: PaymentMethod, amount: number, type: 'increase' | 'decrease'): boolean => {
  try {
    const accounts = getAccounts();
    let accountType: PaymentMethod;
    
    // Map payment method to account type
    switch(paymentMethod) {
      case 'cash':
        accountType = 'cash';
        break;
      case 'mpesa-stk':
        accountType = 'mpesa-stk';
        break;
      case 'mpesa-till':
        accountType = 'mpesa-till';
        break;
      case 'pochi-la-biashara':
        accountType = 'pochi-la-biashara';
        break;
      case 'bank-transfer':
        accountType = 'bank-transfer';
        break;
      case 'credit':
        accountType = 'credit';
        break;
      default:
        accountType = 'other-custom';
    }
    
    // Find the matching account
    const updatedAccounts = accounts.map(account => {
      if (account.type === accountType) {
        const newBalance = type === 'increase' 
          ? account.balance + amount 
          : account.balance - amount;
          
        return {
          ...account,
          balance: newBalance,
          lastUpdated: new Date().toISOString()
        };
      }
      return account;
    });
    
    // Save to localStorage
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    
    // Dispatch event to notify other components about the account update
    window.dispatchEvent(new CustomEvent('accountsUpdated'));
    
    // Create transaction record
    recordTransaction(
      accountType, 
      amount, 
      type === 'increase' ? 'deposit' : 'withdrawal',
      type === 'increase' ? 'Sale' : 'Refund',
      `${type === 'increase' ? 'Sale payment' : 'Refund'} via ${paymentMethod}`
    );
    
    return true;
  } catch (error) {
    console.error('Error updating account balance:', error);
    
    // Store in pending operations if offline
    if (!navigator.onLine) {
      const pendingOperations = JSON.parse(localStorage.getItem('pendingAccountOperations') || '[]');
      pendingOperations.push({
        paymentMethod,
        amount,
        type,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pendingAccountOperations', JSON.stringify(pendingOperations));
    }
    
    return false;
  }
};

// Record a transaction for reporting and history
export const recordTransaction = (
  accountType: PaymentMethod,
  amount: number,
  type: 'deposit' | 'withdrawal' | 'transfer' | 'sale' | 'refund' | 'adjustment',
  reference: string,
  description: string,
  relatedAccountId?: string
): void => {
  try {
    const accounts = getAccounts();
    const account = accounts.find(acc => acc.type === accountType);
    
    if (!account) return;
    
    const transaction: AccountTransaction = {
      id: nanoid(),
      accountId: account.id,
      amount,
      type,
      reference,
      description,
      timestamp: new Date().toISOString(),
      relatedAccountId,
      userId: "current-user-id", // In a real app, this would come from auth context
    };
    
    // Get existing transactions or initialize
    const transactions = JSON.parse(localStorage.getItem('accountTransactions') || '[]');
    transactions.unshift(transaction);
    
    // Store transactions
    localStorage.setItem('accountTransactions', JSON.stringify(transactions));
    
    // If offline, store in pending sync
    if (!navigator.onLine) {
      const pendingTransactions = JSON.parse(localStorage.getItem('pendingTransactions') || '[]');
      pendingTransactions.push(transaction);
      localStorage.setItem('pendingTransactions', JSON.stringify(pendingTransactions));
    }
  } catch (error) {
    console.error('Error recording transaction:', error);
  }
};

// Process pending operations when coming online
export const syncPendingOperations = (): void => {
  if (navigator.onLine) {
    try {
      // Process pending account operations
      const pendingOperations = JSON.parse(localStorage.getItem('pendingAccountOperations') || '[]');
      if (pendingOperations.length > 0) {
        pendingOperations.forEach(op => {
          updateAccountBalance(op.paymentMethod, op.amount, op.type);
        });
        localStorage.setItem('pendingAccountOperations', JSON.stringify([]));
      }
      
      // Process pending transactions (if needed)
      localStorage.setItem('pendingTransactions', JSON.stringify([]));
      
    } catch (error) {
      console.error('Error syncing pending operations:', error);
    }
  }
};

// Initialize sync event listeners
export const initializeSyncListeners = (): void => {
  window.addEventListener('online', syncPendingOperations);
};
