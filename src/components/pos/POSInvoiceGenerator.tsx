
import React from 'react';
import { Transaction, CartItem } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Printer, Share2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { getBusinessCurrency } from '@/utils/settingsUtils';

interface POSInvoiceGeneratorProps {
  transaction?: Transaction;
  cart?: CartItem[];
  total?: number;
  customerName?: string;
  customerId?: string;
  invoiceNumber: string;
  onClose: () => void;
  paidAmount?: number;
}

const POSInvoiceGenerator: React.FC<POSInvoiceGeneratorProps> = ({
  transaction,
  cart = [],
  total = 0,
  customerName = "Customer",
  customerId,
  invoiceNumber,
  onClose,
  paidAmount = 0
}) => {
  // Get currency from business settings
  const currency = getBusinessCurrency();
  
  const handlePrint = () => {
    // Clone the receipt content for printing
    const invoiceContent = document.getElementById('invoice-content')?.cloneNode(true) as HTMLElement;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Add appropriate styles for printing
    const html = `
      <html>
        <head>
          <title>Invoice #${invoiceNumber}</title>
          <style>
            body { font-family: 'Arial', sans-serif; font-size: 12px; line-height: 1.4; }
            .invoice { width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { margin-bottom: 20px; }
            .header h1 { margin: 0; color: #333; }
            .company-details { margin-bottom: 20px; }
            .invoice-details { margin-bottom: 20px; }
            .customer-details { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .footer { margin-top: 40px; font-size: 10px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="invoice">
            ${invoiceContent.innerHTML}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const handleShare = () => {
    // For WhatsApp sharing, we'll create a message with invoice details
    const businessName = localStorage.getItem('businessData') 
      ? JSON.parse(localStorage.getItem('businessData') || '{}').businessName 
      : 'Our Business';
      
    const invoiceDate = transaction ? 
      new Date(transaction.timestamp).toLocaleString() : 
      new Date().toLocaleString();
    
    let message = `*INVOICE from ${businessName}*\n`;
    message += `Invoice #: ${invoiceNumber}\n`;
    message += `Date: ${invoiceDate}\n`;
    message += `Customer: ${customerName}\n\n`;
    message += `*ITEMS*\n`;
    
    const items = transaction ? transaction.items : cart;
    
    items.forEach(item => {
      message += `${item.name} x${item.quantity} - ${currency} ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    // Add paid amount and balance due for partial payments
    const isPartialPayment = paidAmount > 0 || (transaction && transaction.paidAmount > 0);
    const actualPaidAmount = paidAmount || (transaction && transaction.paidAmount) || 0;
    const totalAmount = transaction ? transaction.total : total;
    
    if (isPartialPayment) {
      const totalBill = totalAmount + actualPaidAmount;
      message += `\n*TOTAL BILL*: ${currency} ${formatCurrency(totalBill)}\n`;
      message += `*PAID AMOUNT*: ${currency} ${formatCurrency(actualPaidAmount)}\n`;
      message += `*BALANCE DUE*: ${currency} ${formatCurrency(totalAmount)}\n\n`;
    } else {
      message += `\n*TOTAL AMOUNT DUE*: ${currency} ${formatCurrency(totalAmount)}\n\n`;
    }
    
    message += `Thank you for your business! This is a credit sale, payment is due within 30 days.`;
    
    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  // Get business details from localStorage
  const businessData = localStorage.getItem('businessData') 
    ? JSON.parse(localStorage.getItem('businessData') || '{}')
    : { businessName: 'TellerPOS', businessAddress: '', businessPhone: '' };
  
  const invoiceDate = transaction ? 
    new Date(transaction.timestamp).toLocaleString() : 
    new Date().toLocaleString();
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const invoiceDueDate = dueDate.toLocaleDateString();

  // Calculate total bill for partial payments
  const transactionData = transaction || { 
    total: total,
    paidAmount: paidAmount,
    customerId: customerId,
    items: cart,
    status: 'pending'
  };
  const isPartialPayment = paidAmount > 0 || transactionData.paidAmount > 0;
  const actualPaidAmount = paidAmount || transactionData.paidAmount || 0;
  const totalAmount = transactionData.total;
  const totalBill = isPartialPayment ? totalAmount + actualPaidAmount : totalAmount;

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-center">Invoice #{invoiceNumber}</AlertDialogTitle>
      </AlertDialogHeader>
      
      <div id="invoice-content" className="bg-white dark:bg-gray-950 p-4 my-4 rounded-lg border dark:border-gray-800 text-sm max-h-[60vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <div>
            <h3 className="font-bold text-xl">{businessData.businessName}</h3>
            <p className="text-xs text-gray-500">{businessData.businessAddress}</p>
            <p className="text-xs text-gray-500">{businessData.businessPhone}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-primary">INVOICE</h2>
            <p className="text-xs"># {invoiceNumber}</p>
            <p className="text-xs text-gray-500">Date: {invoiceDate}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-6">
          <h4 className="font-semibold mb-1">Bill To:</h4>
          <p className="font-medium">{customerName}</p>
          <p className="text-xs text-gray-500">Customer ID: {transactionData.customerId}</p>
        </div>
        
        <table className="w-full mb-6">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-2">Item</th>
              <th className="p-2 text-center">Qty</th>
              <th className="p-2 text-right">Unit Price</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transactionData.items.map((item, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{currency} {formatCurrency(item.price)}</td>
                <td className="p-2 text-right">{currency} {formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-end">
          <div className="w-1/2">
            {isPartialPayment ? (
              <>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Total Bill:</span>
                  <span>{currency} {formatCurrency(totalBill)}</span>
                </div>
                <div className="flex justify-between py-2 text-green-600">
                  <span className="font-medium">Amount Paid:</span>
                  <span>{currency} {formatCurrency(actualPaidAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 font-bold">
                  <span>BALANCE DUE:</span>
                  <span>{currency} {formatCurrency(totalAmount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>{currency} {formatCurrency(totalAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 font-bold">
                  <span>TOTAL DUE:</span>
                  <span>{currency} {formatCurrency(totalAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 p-3 border border-dashed rounded-md">
          <h4 className="font-semibold mb-1">Payment Details:</h4>
          <p className="text-xs">Payment due by: {invoiceDueDate}</p>
          <p className="text-xs">Payment Method: Credit</p>
          <p className="text-xs">Payment Status: {transactionData.status === 'paid' ? 'Paid' : 'Pending'}</p>
          {isPartialPayment && (
            <p className="text-xs mt-1 text-amber-600">Note: This is a partial invoice. A separate receipt has been generated for the paid amount.</p>
          )}
        </div>
        
        <div className="mt-6 text-center text-xs">
          <p className="font-medium">Thank you for your business!</p>
        </div>
      </div>
      
      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex-1" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Invoice
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" /> Share via WhatsApp
        </Button>
        <Button variant="default" className="flex-1" onClick={onClose}>
          <X className="mr-2 h-4 w-4" /> Close
        </Button>
      </AlertDialogFooter>
    </>
  );
};

export default POSInvoiceGenerator;
