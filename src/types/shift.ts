
export interface PaymentMethodTotals {
  mpesa: number;
  mpesaTill: number;
  pochiBiashara: number;
  card: number;
  bankTransfer: number;
  cash: number;
  credit: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  timestamp: string;
}

export interface Shift {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  status: 'active' | 'closed';
  paymentTotals: PaymentMethodTotals;
  expenses: Expense[];
  totalSales: number;
  clockInTime: string;
  clockOutTime?: string;
  date: string;
  userId: string;
}

export interface ShiftFormValues {
  openingBalance: number;
}
