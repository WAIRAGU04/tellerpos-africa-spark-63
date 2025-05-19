
import { Transaction } from '@/types/pos';
import { ShiftSummary } from '@/types/shift';
import { AccountSummary } from '@/types/accounts';
import { InventoryItem } from '@/types/inventory';

export interface UserPerformance {
  userId: string;
  salesCount: number;
  totalAmount: number;
  userName?: string;
}

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
}

export interface AnalyticsContextType {
  salesData: Transaction[];
  shiftData: ShiftSummary[];
  accountsData: AccountSummary;
  inventoryStats: InventoryStats;
  inventoryData: InventoryItem[];
  userPerformanceData: UserPerformance[];
  refreshAnalytics: () => void;
  isLoading: boolean;
}
