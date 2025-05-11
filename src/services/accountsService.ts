
import { Account, AccountTransaction } from '@/types/accounts';
import { PaymentMethod } from '@/types/pos';
import { nanoid } from 'nanoid';
import { toast } from '@/hooks/use-toast';

// Default accounts that will be created if none exist
const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-cash-default',
    name: 'Cash Box',
    type: 'cash',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-mpesa-default',
    name: 'M-Pesa',
    type: 'mpesa-stk',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-mpesa-till-default',
    name: 'M-Pesa Till',
    type: 'mpesa-till',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-pochi-default',
    name: 'Pochi La Biashara',
    type: 'pochi-la-biashara',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-card-default',
    name: 'Card Payments',
    type: 'other-custom',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-bank-default',
    name: 'Bank Transfer',
    type: 'bank-transfer',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'acc-credit-default',
    name: 'Customer Credit',
    type: 'credit',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  }
];

// Initialize accounts
export const initializeAccounts = (): void => {
  const accounts = getAccounts();
  
  // If no accounts exist, create default ones
  if (accounts.length === 0) {
    localStorage.setItem('accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    console.log('Default accounts created');
  }
};

// Get all accounts
export const getAccounts = (): Account[] => {
  const accountsData = localStorage.getItem('accounts');
  return accountsData ? JSON.parse(accountsData) : [];
};

// Get account by type
export const getAccountByType = (type: PaymentMethod): Account | undefined => {
  const accounts = getAccounts();
  return accounts.find(account => account.type === type);
};

// Update account balance
export const updateAccountBalance = (
  accountId: string,
  amount: number,
  transactionType: 'deposit' | 'withdrawal' | 'transfer' | 'sale' | 'refund' | 'adjustment',
  description: string,
  reference?: string,
  shiftId?: string,
  userId: string = 'current-user'
): boolean => {
  const accounts = getAccounts();
  const accountIndex = accounts.findIndex(acc => acc.id === accountId);
  
  if (accountIndex === -1) {
    console.error(`Account with ID ${accountId} not found`);
    return false;
  }
  
  const account = accounts[accountIndex];
  const newBalance = transactionType === 'withdrawal' || transactionType === 'refund'
    ? account.balance - amount
    : account.balance + amount;
  
  // Update account
  accounts[accountIndex] = {
    ...account,
    balance: newBalance,
    lastUpdated: new Date().toISOString()
  };
  
  // Save updated accounts
  localStorage.setItem('accounts', JSON.stringify(accounts));
  
  // Create transaction record
  const transaction: AccountTransaction = {
    id: nanoid(),
    accountId,
    amount,
    type: transactionType,
    reference: reference || `tx-${nanoid(8)}`,
    description,
    timestamp: new Date().toISOString(),
    userId,
    shiftId
  };
  
  // Get existing transactions
  const transactions = getTransactions();
  transactions.push(transaction);
  
  // Save transactions
  localStorage.setItem('accountTransactions', JSON.stringify(transactions));
  
  return true;
};

// Get all transactions
export const getTransactions = (): AccountTransaction[] => {
  const transactionsData = localStorage.getItem('accountTransactions');
  return transactionsData ? JSON.parse(transactionsData) : [];
};

// Record a sale across multiple payment methods
export const recordSaleInAccounts = (
  payments: Array<{ method: PaymentMethod, amount: number }>,
  reference: string,
  shiftId?: string,
  userId: string = 'current-user'
): boolean => {
  let allSuccessful = true;
  
  for (const payment of payments) {
    const account = getAccountByType(payment.method);
    if (!account) {
      console.error(`No account found for payment method: ${payment.method}`);
      allSuccessful = false;
      continue;
    }
    
    const success = updateAccountBalance(
      account.id,
      payment.amount,
      'sale',
      `Sale recorded - ${reference}`,
      reference,
      shiftId,
      userId
    );
    
    if (!success) {
      allSuccessful = false;
    }
  }
  
  return allSuccessful;
};

