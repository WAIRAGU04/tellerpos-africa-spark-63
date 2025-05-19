
import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { AnalyticsContextType } from '@/types/analytics';

// Create context with default values
const AnalyticsContext = createContext<AnalyticsContextType>({
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
});

// Export the useAnalytics hook
export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Use our custom hook to get all analytics data
  const analyticsData = useAnalyticsData();
  
  return (
    <AnalyticsContext.Provider value={analyticsData}>
      {children}
    </AnalyticsContext.Provider>
  );
};
