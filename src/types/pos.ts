
export type PaymentMethod = 'cash' | 'mpesa-stk' | 'mpesa-till' | 'pochi-la-biashara' | 'card' | 'bank-transfer' | 'credit' | 'other-custom';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases?: number;
  lastPurchase?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  isTaxable?: boolean;
  type?: 'product' | 'service';
  imageUrl?: string;
  color?: string;
  productType?: 'product' | 'service';
}

export interface Payment {
  id?: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  timestamp: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  payments: Payment[];
  total: number;
  subtotal: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  change?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded' | 'paid';
  timestamp: string;
  customer?: Customer;
  customerId?: string;
  customerName?: string;
  notes?: string;
  userId: string;
  shiftId?: string;
  receiptNumber?: string;
  isInvoice?: boolean;
  paidAmount?: number;
  balanceAmount?: number;
}

export interface POSCheckoutProps {
  cart: CartItem[];
  cartTotal: number;
  onBackToCart: () => void;
  clearCart: () => void;
  onPaymentComplete?: (paymentMethod: PaymentMethod, amount: number) => void;
}
