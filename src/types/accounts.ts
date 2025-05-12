
import { PaymentMethod } from './pos';

export type AccountType = PaymentMethod;

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  lastUpdated: string;
}

export interface AccountTransaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'sale' | 'refund' | 'adjustment';
  reference: string;
  description: string;
  timestamp: string;
  relatedAccountId?: string;
  userId: string;
  shiftId?: string;
}

export interface AccountTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  timestamp: string;
  description: string;
  userId: string;
}

export type SalesOrderStatus = 'draft' | 'pending' | 'approved' | 'fulfilled' | 'cancelled';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: SalesOrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  userId: string;
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerCompany?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPhone?: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    isTaxable?: boolean;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: QuotationStatus;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  userId: string;
}

export interface ReportFilter {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  paymentMethods?: PaymentMethod[];
  userId?: string;
  shiftId?: string;
}

export interface AccountSummary {
  totalCash: number;
  totalMpesa: number;
  totalBankTransfer: number;
  totalCredit: number;
  totalSales: number;
  totalRefunds: number;
  netSales: number;
}
