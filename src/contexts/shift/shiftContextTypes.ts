
import { Shift, Expense } from '@/types/shift';
import { CartItem, PaymentMethod as PosPaymentMethod, Transaction } from '@/types/pos';

// Using POS payment method type directly to avoid conflicts
export type { PosPaymentMethod as PaymentMethod };

export interface ShiftContextType {
  activeShift: Shift | null;
  isLoading: boolean;
  startShift: (openingBalance: number) => void;
  closeShift: () => void;  // Add this back
  endShift?: () => void;   // Make optional for backward compatibility
  addExpense: (expense: Omit<Expense, "id" | "timestamp">) => void;
  addShiftExpense?: (expense: Omit<Expense, "id" | "timestamp">) => void;
  updateShiftWithSale: (items: CartItem[], paymentMethod: PosPaymentMethod, amount: number) => void;
  updateShiftWithSplitSale: (items: CartItem[], paymentMethods: { method: PosPaymentMethod, amount: number }[]) => void;
  getShiftHistory?: () => Shift[];
  getShiftById?: (id: string) => Shift | undefined;
  getActiveShift?: () => Shift | null;
  refreshShiftData?: () => void;
  recordTransaction?: (transaction: Transaction) => boolean;
}
