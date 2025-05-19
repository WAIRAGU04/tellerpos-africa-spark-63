
import { Transaction } from '@/types/pos';
import { Shift } from '@/types/shift';
import { InventoryItem } from '@/types/inventory';
import { AccountSummary } from '@/types/accounts';

// Calculate account summary from transaction data
export const calculateAccountSummary = (transactions: Transaction[]): AccountSummary => {
  return {
    totalCash: transactions.reduce((sum: number, t: Transaction) => 
      sum + (t.payments.find(p => p.method === 'cash')?.amount || 0), 0),
    totalMpesa: transactions.reduce((sum: number, t: Transaction) => 
      sum + (t.payments.find(p => p.method === 'mpesa-stk' || p.method === 'mpesa-till')?.amount || 0), 0),
    totalBankTransfer: transactions.reduce((sum: number, t: Transaction) => 
      sum + (t.payments.find(p => p.method === 'bank-transfer')?.amount || 0), 0),
    totalCredit: transactions.reduce((sum: number, t: Transaction) => 
      sum + (t.payments.find(p => p.method === 'credit')?.amount || 0), 0),
    totalSales: transactions.reduce((sum: number, t: Transaction) => sum + t.total, 0),
    totalRefunds: transactions.filter((t: Transaction) => t.type === 'refund').reduce((sum: number, t: Transaction) => sum + t.total, 0),
    netSales: transactions.reduce((sum: number, t: Transaction) => sum + (t.type === 'sale' ? t.total : -t.total), 0),
  };
};

// Calculate inventory statistics
export const calculateInventoryStats = (inventory: InventoryItem[]) => {
  const productItems = inventory.filter((item) => item.type === 'product');
  const lowStockItems = productItems.filter((item: any) => 
    item.quantity !== undefined && 
    item.lowStockThreshold !== undefined && 
    item.quantity < item.lowStockThreshold
  );
  const outOfStockItems = productItems.filter((item: any) => 
    item.quantity === undefined || 
    item.quantity === 0
  );
  
  return {
    totalProducts: productItems.length,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    inventoryValue: productItems.reduce((sum: number, item: any) => 
      sum + ((item.price || 0) * (item.quantity || 0)), 0
    ),
  };
};

// Calculate user performance data from transactions
export const calculateUserPerformance = (transactions: Transaction[]) => {
  if (transactions.length === 0) return [];
  
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
  
  return Array.from(userMap.values());
};

// Generate shift summaries from shift data
export const generateShiftSummaries = (shifts: Shift[]) => {
  return shifts.map((shift: Shift) => ({
    id: shift.id,
    shiftNumber: parseInt(shift.id.slice(-4), 10),
    totalSales: shift.totalSales,
    totalExpenses: shift.expenses.reduce((total: number, exp: any) => total + exp.amount, 0),
    transactionCount: shift.transactions ? shift.transactions.length : 0,
    startTime: shift.clockInTime,
    endTime: shift.clockOutTime || undefined,
  }));
};
