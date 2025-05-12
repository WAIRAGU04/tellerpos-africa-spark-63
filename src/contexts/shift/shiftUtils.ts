
import { Shift, PaymentMethodTotals } from '@/types/shift';
import { PaymentMethod } from '@/types/pos';

/**
 * Calculate expected cash based on opening balance, cash sales, and expenses
 */
export const calculateExpectedCash = (shift: Shift): number => {
  const totalExpenses = shift.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return shift.openingBalance + shift.paymentTotals.cash - totalExpenses;
};

/**
 * Map POS payment methods to shift payment methods
 */
export const mapPaymentMethod = (posMethod: PaymentMethod): keyof PaymentMethodTotals => {
  switch (posMethod) {
    case 'cash': return 'cash';
    case 'mpesa-stk': return 'mpesa';
    case 'mpesa-till': return 'mpesaTill';
    case 'pochi-la-biashara': return 'pochiBiashara';
    case 'bank-transfer': return 'bankTransfer';
    case 'credit': return 'credit';
    case 'other-custom': return 'cash'; // Default to cash for custom methods
    default: return 'cash';
  }
};
