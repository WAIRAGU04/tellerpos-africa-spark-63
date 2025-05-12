
import { nanoid } from 'nanoid';
import { CartItem, Transaction, PaymentMethod } from '@/types/pos';

export const getPaymentMethodName = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash': return 'Cash';
    case 'mpesa-stk': return 'M-Pesa STK Push';
    case 'mpesa-till': return 'M-Pesa Till';
    case 'pochi-la-biashara': return 'Pochi La Biashara';
    case 'bank-transfer': return 'Bank Transfer';
    case 'credit': return 'Customer Credit';
    case 'other-custom': return 'Other Payment';
    default: return method;
  }
};

export const generateReceiptNumber = (): string => {
  return `RC-${nanoid(8).toUpperCase()}`;
};

export const createTransactionObject = (
  cart: CartItem[],
  cartTotal: number,
  paymentMethod: PaymentMethod,
  customerId: string | null,
  isSplitPayment: boolean = false
): Transaction => {
  const receiptNum = generateReceiptNumber();
  return {
    id: nanoid(),
    items: cart,
    payments: isSplitPayment ? [] : [{ 
      id: nanoid(), 
      method: paymentMethod, 
      amount: cartTotal,
      timestamp: new Date().toISOString() 
    }],
    total: cartTotal,
    subtotal: cartTotal,
    customerId: customerId || undefined,
    timestamp: new Date().toISOString(),
    receiptNumber: receiptNum,
    status: 'completed',
    customerName: customerId ? 'Selected Customer' : undefined,
    userId: ''
  };
};
