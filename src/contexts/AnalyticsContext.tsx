
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '@/types/pos';
import { Shift, ShiftSummary } from '@/types/shift';
import { AccountSummary, AccountingStats } from '@/types/accounts';

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
  userPerformanceData: [],
  refreshAnalytics: () => {},
  isLoading: true,
};

const AnalyticsContext = createContext<AnalyticsContextType>(defaultAnalyticsContext);

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [salesData, setSalesData] = useState<Transaction[]>([]);
  const [shiftData, setShiftData] = useState<ShiftSummary[]>([]);
  const [accountsData, setAccountsData] = useState<AccountSummary>(defaultAnalyticsContext.accountsData);
  const [inventoryStats, setInventoryStats] = useState(defaultAnalyticsContext.inventoryStats);
  const [userPerformanceData, setUserPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
        transactionCount: Math.floor(Math.random() * 20) + 5, // Placeholder
        startTime: shift.clockInTime,
        endTime: shift.clockOutTime || undefined,
      }));
      setShiftData(summaries);
    }
    
    // Load accounts summary
    const storedAccountsSummary = localStorage.getItem('accountsSummary');
    if (storedAccountsSummary) {
      setAccountsData(JSON.parse(storedAccountsSummary));
    } else {
      // Generate sample data if not available
      const transactions = salesData.length > 0 ? salesData : [];
      const summary: AccountSummary = {
        totalCash: transactions.reduce((sum, t) => sum + (t.payments.find(p => p.method === 'cash')?.amount || 0), 0),
        totalMpesa: transactions.reduce((sum, t) => sum + (t.payments.find(p => p.method === 'mpesa-stk' || p.method === 'mpesa-till')?.amount || 0), 0),
        totalBankTransfer: transactions.reduce((sum, t) => sum + (t.payments.find(p => p.method === 'bank-transfer')?.amount || 0), 0),
        totalCredit: transactions.reduce((sum, t) => sum + (t.payments.find(p => p.method === 'credit')?.amount || 0), 0),
        totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
        totalRefunds: 0, // Placeholder
        netSales: transactions.reduce((sum, t) => sum + t.total, 0),
      };
      setAccountsData(summary);
      localStorage.setItem('accountsSummary', JSON.stringify(summary));
    }
    
    // Load inventory statistics
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      const inventory = JSON.parse(storedInventory);
      const productItems = inventory.filter((item: any) => item.type === 'product');
      const lowStockItems = productItems.filter((item: any) => item.quantity && item.quantity < item.lowStockThreshold);
      const outOfStockItems = productItems.filter((item: any) => !item.quantity || item.quantity === 0);
      
      const inventoryStats = {
        totalProducts: productItems.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        inventoryValue: productItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 0)), 0),
      };
      setInventoryStats(inventoryStats);
    }
    
    // Generate user performance data
    const userMap = new Map();
    if (salesData.length > 0) {
      salesData.forEach(transaction => {
        const userId = transaction.userId;
        if (!userMap.has(userId)) {
          userMap.set(userId, { 
            userId, 
            salesCount: 0, 
            totalAmount: 0,
            userName: `User ${userId.substring(0, 5)}` // Placeholder
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
  
  // Initial load and periodic refresh
  useEffect(() => {
    loadAnalyticsData();
    
    // Refresh analytics data every 5 minutes
    const intervalId = setInterval(() => {
      loadAnalyticsData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <AnalyticsContext.Provider
      value={{
        salesData,
        shiftData,
        accountsData,
        inventoryStats,
        userPerformanceData,
        refreshAnalytics: loadAnalyticsData,
        isLoading,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
