
import { Shift, ShiftExpense } from '@/types/shift';
import { Transaction, PaymentMethod } from '@/types/pos';

export interface ShiftContextType {
  activeShift: Shift | null;
  isLoading: boolean;
  startShift: (openingBalance: number, notes?: string) => boolean;
  endShift: (notes?: string) => {
    success: boolean;
    shiftData?: Shift;
    error?: string;
  };
  updateShiftWithSale: (amount: number, paymentMethod: PaymentMethod, transactionId?: string) => boolean;
  updateShiftWithSplitSale: (payments: { method: PaymentMethod; amount: number }[]) => boolean;
  addShiftExpense: (expense: Omit<ShiftExpense, 'id' | 'timestamp'>) => boolean;
  getShiftHistory: () => Shift[];
  getShiftById: (id: string) => Shift | null;
  getShiftTransactions: (shiftId: string) => Transaction[];
  shiftHistory: Shift[];
  recordTransaction: (transaction: Transaction) => boolean;
  updateTransactionStatus: (transactionId: string, status: Transaction['status'], paymentReference?: string) => boolean;
}
