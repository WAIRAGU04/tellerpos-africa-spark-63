
import { useState, useEffect, useCallback } from 'react';
import { 
  calculateAccountSummary,
  calculateInventoryStats, 
  calculateUserPerformance,
  generateShiftSummaries
} from '@/utils/analyticsUtils';
import { Transaction } from '@/types/pos';
import { Shift, ShiftSummary } from '@/types/shift';
import { InventoryItem } from '@/types/inventory';
import { AccountSummary } from '@/types/accounts';
import { InventoryStats, UserPerformance } from '@/types/analytics';

export interface AnalyticsData {
  salesData: Transaction[];
  shiftData: ShiftSummary[];
  accountsData: AccountSummary;
  inventoryStats: InventoryStats;
  inventoryData: InventoryItem[];
  userPerformanceData: UserPerformance[];
  isLoading: boolean;
}

export const useAnalyticsData = () => {
  // Define state
  const [salesData, setSalesData] = useState<Transaction[]>([]);
  const [shiftData, setShiftData] = useState<ShiftSummary[]>([]);
  const [accountsData, setAccountsData] = useState<AccountSummary>({
    totalCash: 0,
    totalMpesa: 0,
    totalBankTransfer: 0,
    totalCredit: 0,
    totalSales: 0,
    totalRefunds: 0,
    netSales: 0,
  });
  const [inventoryStats, setInventoryStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inventoryValue: 0,
  });
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [userPerformanceData, setUserPerformanceData] = useState<UserPerformance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data function
  const loadAnalyticsData = useCallback(() => {
    setIsLoading(true);
    
    // Load transactions data for sales analysis
    const storedTransactions = localStorage.getItem('transactions');
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    setSalesData(transactions);
    
    // Load shift history data
    const storedShiftHistory = localStorage.getItem('shiftHistory');
    if (storedShiftHistory) {
      const shifts: Shift[] = JSON.parse(storedShiftHistory);
      const summaries = generateShiftSummaries(shifts);
      setShiftData(summaries);
    }
    
    // Calculate account summary from actual transaction data
    if (transactions.length > 0) {
      const summary = calculateAccountSummary(transactions);
      setAccountsData(summary);
    }
    
    // Load inventory data and calculate stats
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      const inventory: InventoryItem[] = JSON.parse(storedInventory);
      setInventoryData(inventory);
      
      const stats = calculateInventoryStats(inventory);
      setInventoryStats(stats);
    }
    
    // Generate user performance data from actual transactions
    if (transactions.length > 0) {
      const performanceData = calculateUserPerformance(transactions);
      setUserPerformanceData(performanceData);
    }
    
    setIsLoading(false);
  }, []);

  // Set up event listeners for real-time updates
  useEffect(() => {
    loadAnalyticsData();
    
    // Listen for storage changes to update data in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'transactions' || e.key === 'inventory' || e.key === 'shiftHistory') {
        loadAnalyticsData();
      }
    };
    
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
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('inventory-updated', handleInventoryUpdate);
    window.addEventListener('transaction-completed', handleTransactionCompleted);
    window.addEventListener('shift-updated', handleShiftUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('inventory-updated', handleInventoryUpdate);
      window.removeEventListener('transaction-completed', handleTransactionCompleted);
      window.removeEventListener('shift-updated', handleShiftUpdate);
    };
  }, [loadAnalyticsData]);

  return {
    salesData,
    shiftData,
    accountsData,
    inventoryStats,
    inventoryData,
    userPerformanceData,
    isLoading,
    refreshAnalytics: loadAnalyticsData
  };
};
