
import { CartItem } from '@/types/pos';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type SalesOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'draft' | 'approved' | 'fulfilled';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially-paid';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type AccountTransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'sale' | 'refund' | 'adjustment';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId?: string;
  customerName: string;
  customerCompany?: string;
  customerAddress?: string;
  customerCity?: string;
  customerPhone?: string;
  items: CartItem[];
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

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: SalesOrderStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  userId: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  userId: string;
  salesOrderId?: string;
  payments: Payment[];
  balanceDue: number;
  paidAmount: number;
}

export interface Payment {
  id: string;
  invoiceId?: string;
  method: 'cash' | 'mpesa' | 'card' | 'bank-transfer' | 'check' | 'credit';
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  userId: string;
}

export interface AccountingStats {
  totalQuotations: number;
  totalOrders: number;
  totalInvoices: number;
  totalPayments: number;
  pendingInvoicesAmount: number;
  paidInvoicesAmount: number;
  overdueInvoicesAmount: number;
}

// Account-related types
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  lastUpdated: string;
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

export interface AccountTransaction {
  id: string;
  accountId: string;
  amount: number;
  type: AccountTransactionType;
  reference: string;
  description: string;
  timestamp: string;
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

export interface ReportFilter {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  paymentMethods?: string[];
  userId?: string;
  shiftId?: string;
}
