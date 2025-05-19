
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '@/types/pos';
import { Shift, ShiftSummary } from '@/types/shift';
import { AccountSummary } from '@/types/accounts';
import { InventoryItem } from '@/types/inventory';

interface AnalyticsContextType {
  salesData: Transaction[];
  shiftData: ShiftSummary[];
  accountsData: AccountSummary;
  inventoryStats: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    inventoryValue: number;
  };
  inventoryData: InventoryItem[];
  userPerformanceData: {
    userId: string;
    salesCount: number;
    totalAmount: number;
    userName?: string;
  }[];
  refreshAnalytics: () => void;
  isLoading: boolean;
}

const defaultAnalyticsContext: AnalyticsContextType = {
  salesData: [],
  shiftData: [],
  accountsData: {
    totalCash: 0,
    totalMpesa: 0,
    totalBankTransfer: 0,
    totalCredit: 0,
    totalSales: 0,
    totalRefunds: 0,
    netSales: 0,
  },
  inventoryStats: {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inventoryValue: 0,
  },
  inventoryData: [],
  userPerformanceData: [],
  refreshAnalytics: () => {},
  isLoading: true,
};

// Create context with default values
const AnalyticsContext = createContext<AnalyticsContextType>(defaultAnalyticsContext);

// Export the useAnalytics hook
export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Define state with useState hooks
  const [salesData, setSalesData] = useState<Transaction[]>([]);
  const [shiftData, setShiftData] = useState<ShiftSummary[]>([]);
  const [accountsData, setAccountsData] = useState<AccountSummary>(defaultAnalyticsContext.accountsData);
  const [inventoryStats, setInventoryStats] = useState(defaultAnalyticsContext.inventoryStats);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [userPerformanceData, setUserPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load analytics data from storage and calculate derived statistics
  const loadAnalyticsData = () => {
    setIsLoading(true);
    
    // Load transactions data for sales analysis
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setSalesData(JSON.parse(storedTransactions));
    }
    
    // Load shift history data
    const storedShiftHistory = localStorage.getItem('shiftHistory');
    if (storedShiftHistory) {
      const shifts = JSON.parse(storedShiftHistory);
      const summaries: ShiftSummary[] = shifts.map((shift: Shift) => ({
        id: shift.id,
        shiftNumber: parseInt(shift.id.slice(-4), 10),
        totalSales: shift.totalSales,
        totalExpenses: shift.expenses.reduce((total: number, exp: any) => total + exp.amount, 0),
        transactionCount: shift.transactions ? shift.transactions.length : 0,
        startTime: shift.clockInTime,
        endTime: shift.clockOutTime || undefined,
      }));
      setShiftData(summaries);
    }
    
    // Load accounts summary
    const storedTransactions = localStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    
    // Calculate account summary from actual transaction data
    const summary: AccountSummary = {
      totalCash: transactions.reduce((sum: number, t: Transaction) => sum + (t.payments.find(p => p.method === 'cash')?.amount || 0), 0),
      totalMpesa: transactions.reduce((sum: number, t: Transaction) => sum + (t.payments.find(p => p.method === 'mpesa-stk' || p.method === 'mpesa-till')?.amount || 0), 0),
      totalBankTransfer: transactions.reduce((sum: number, t: Transaction) => sum + (t.payments.find(p => p.method === 'bank-transfer')?.amount || 0), 0),
      totalCredit: transactions.reduce((sum: number, t: Transaction) => sum + (t.payments.find(p => p.method === 'credit')?.amount || 0), 0),
      totalSales: transactions.reduce((sum: number, t: Transaction) => sum + t.total, 0),
      totalRefunds: transactions.filter((t: Transaction) => t.type === 'refund').reduce((sum: number, t: Transaction) => sum + t.total, 0),
      netSales: transactions.reduce((sum: number, t: Transaction) => sum + (t.type === 'sale' ? t.total : -t.total), 0),
    };
    setAccountsData(summary);
    
    // Load inventory data and calculate stats
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      const inventory = JSON.parse(storedInventory);
      setInventoryData(inventory);
      
      const productItems = inventory.filter((item: any) => item.type === 'product');
      const lowStockItems = productItems.filter((item: any) => 
        item.quantity !== undefined && 
        item.lowStockThreshold !== undefined && 
        item.quantity < item.lowStockThreshold
      );
      const outOfStockItems = productItems.filter((item: any) => 
        item.quantity === undefined || 
        item.quantity === 0
      );
      
      const inventoryStats = {
        totalProducts: productItems.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        inventoryValue: productItems.reduce((sum: number, item: any) => 
          sum + ((item.price || 0) * (item.quantity || 0)), 0
        ),
      };
      setInventoryStats(inventoryStats);
    }
    
    // Generate user performance data from actual transactions
    if (transactions.length > 0) {
      const userMap = new Map();
      transactions.forEach((transaction: Transaction) => {
        const userId = transaction.userId;
        if (!userMap.has(userId)) {
          userMap.set(userId, { 
            userId, 
            salesCount: 0, 
            totalAmount: 0,
            userName: transaction.cashierName || `User ${userId.substring(0, 5)}`
          });
        }
        const userData = userMap.get(userId);
        userData.salesCount++;
        userData.totalAmount += transaction.total;
      });
      setUserPerformanceData(Array.from(userMap.values()));
    }
    
    setIsLoading(false);
  };
  
  // Initial load and real-time event handlers
  useEffect(() => {
    loadAnalyticsData();
    
    // Listen for storage changes to update data in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'transactions' || e.key === 'inventory' || e.key === 'shiftHistory') {
        loadAnalyticsData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Add custom event listeners for real-time updates from other modules
    const handleInventoryUpdate = () => {
      loadAnalyticsData();
    };
    
    const handleTransactionCompleted = () => {
      loadAnalyticsData();
    };
    
    const handleShiftUpdate = () => {
      loadAnalyticsData();
    };
    
    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('transaction-completed', handleTransactionCompleted);
    window.addEventListener('shift-updated', handleShiftUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('transaction-completed', handleTransactionCompleted);
      window.removeEventListener('shift-updated', handleShiftUpdate);
    };
  }, []);
  
  return (
    <AnalyticsContext.Provider
      value={{
        salesData,
        shiftData,
        accountsData,
        inventoryStats,
        inventoryData,
        userPerformanceData,
        refreshAnalytics: loadAnalyticsData,
        isLoading,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
