
import { Shift, Expense } from '@/types/shift';
import { CartItem, PaymentMethod } from '@/types/pos';

export type ShiftContextType = {
  activeShift: Shift | null;
  isLoading: boolean;
  startShift: (openingBalance: number) => void;
  closeShift: () => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  updateShiftWithSale: (items: CartItem[], paymentMethod: PaymentMethod, amount: number) => void;
  updateShiftWithSplitSale: (items: CartItem[], payments: Array<{method: PaymentMethod, amount: number}>) => void;
};
