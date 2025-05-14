
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

export const generateInvoiceNumber = (): string => {
  return `INV-${nanoid(8).toUpperCase()}`;
};

export const generateQuotationNumber = (): string => {
  return `QT-${nanoid(8).toUpperCase()}`;
};

export const createTransactionObject = (
  cart: CartItem[],
  cartTotal: number,
  paymentMethod: PaymentMethod,
  customerId: string | null,
  isSplitPayment: boolean = false
): Transaction => {
  // Determine if this should be an invoice
  const isInvoice = paymentMethod === 'credit';
  
  // Generate appropriate document number
  const documentNumber = isInvoice ? generateInvoiceNumber() : generateReceiptNumber();
  
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
    receiptNumber: documentNumber,
    status: isInvoice ? 'pending' : 'completed',
    customerName: customerId ? 'Selected Customer' : undefined,
    userId: '',
    isInvoice: isInvoice,
    // For credit sales, the entire amount is unpaid
    paidAmount: isInvoice ? 0 : cartTotal,
    balanceAmount: isInvoice ? cartTotal : 0
  };
};

export const calculateTaxableAmount = (items: CartItem[]): { 
  taxableAmount: number, 
  nonTaxableAmount: number,
  totalTax: number
} => {
  let taxableAmount = 0;
  let nonTaxableAmount = 0;
  
  items.forEach(item => {
    // Default to taxable if isTaxable is not explicitly set to false
    if (item.isTaxable !== false) {
      taxableAmount += item.price * item.quantity;
    } else {
      nonTaxableAmount += item.price * item.quantity;
    }
  });
  
  // Default tax rate is 16% VAT
  const taxRate = 0.16;
  const totalTax = taxableAmount * taxRate;
  
  return { taxableAmount, nonTaxableAmount, totalTax };
};

export const formatQuotationDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const getFormattedExpiryDate = (days = 30): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatQuotationDate(date);
};
