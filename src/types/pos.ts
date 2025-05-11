
export type PaymentMethod = 
  | 'cash'
  | 'mpesa-stk'
  | 'mpesa-till'
  | 'pochi-la-biashara'
  | 'bank-transfer'
  | 'credit'
  | 'other-custom';

export type PaymentType = 'full' | 'split';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'product' | 'service';
  imageUrl?: string;
  color?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  payments: Payment[];
  total: number;
  customerId?: string;
  timestamp: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'cancelled';
  isInvoice?: boolean;
}

export interface POSCheckoutProps {
  cart: CartItem[];
  cartTotal: number;
  onBackToCart: () => void;
  clearCart: () => void;
  onPaymentComplete?: (paymentMethod: PaymentMethod, amount: number) => void;
}
