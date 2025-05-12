
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
  productType?: 'product' | 'service';
}

export interface Payment {
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
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  timestamp: string;
  customer?: Customer;
  notes?: string;
  userId: string;
  shiftId?: string;
}
