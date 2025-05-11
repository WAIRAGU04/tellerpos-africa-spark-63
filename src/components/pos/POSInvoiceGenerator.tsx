
import React from 'react';
import { Transaction } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Printer, Share2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface POSInvoiceGeneratorProps {
  transaction: Transaction;
  customerName: string;
  onClose: () => void;
}

const POSInvoiceGenerator: React.FC<POSInvoiceGeneratorProps> = ({
  transaction,
  customerName,
  onClose
}) => {
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
          <title>Invoice #${transaction.receiptNumber}</title>
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
      
    const invoiceDate = new Date(transaction.timestamp).toLocaleString();
    
    let message = `*INVOICE from ${businessName}*\n`;
    message += `Invoice #: ${transaction.receiptNumber}\n`;
    message += `Date: ${invoiceDate}\n`;
    message += `Customer: ${customerName}\n\n`;
    message += `*ITEMS*\n`;
    
    transaction.items.forEach(item => {
      message += `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    message += `\n*TOTAL AMOUNT DUE*: ${formatCurrency(transaction.total)}\n\n`;
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
  
  const invoiceDate = new Date(transaction.timestamp).toLocaleString();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const invoiceDueDate = dueDate.toLocaleDateString();

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-center">Invoice #{transaction.receiptNumber}</AlertDialogTitle>
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
            <p className="text-xs"># {transaction.receiptNumber}</p>
            <p className="text-xs text-gray-500">Date: {invoiceDate}</p>
          </div>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md mb-6">
          <h4 className="font-semibold mb-1">Bill To:</h4>
          <p className="font-medium">{customerName}</p>
          <p className="text-xs text-gray-500">Customer ID: {transaction.customerId}</p>
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
            {transaction.items.map((item, index) => (
              <tr key={index} className="border-b dark:border-gray-700">
                <td className="p-2">{item.name}</td>
                <td className="p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                <td className="p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-end">
          <div className="w-1/2">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
            <Separator />
            <div className="flex justify-between py-2 font-bold">
              <span>TOTAL DUE:</span>
              <span>{formatCurrency(transaction.total)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-3 border border-dashed rounded-md">
          <h4 className="font-semibold mb-1">Payment Details:</h4>
          <p className="text-xs">Payment due by: {invoiceDueDate}</p>
          <p className="text-xs">Payment Method: Credit</p>
          <p className="text-xs">Payment Status: Pending</p>
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
