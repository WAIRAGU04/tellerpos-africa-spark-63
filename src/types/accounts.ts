
import { CartItem } from '@/types/pos';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
export type SalesOrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partially-paid';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

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
