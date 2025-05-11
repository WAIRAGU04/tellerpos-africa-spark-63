
import React from 'react';
import { Transaction } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Printer, Share2, X, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface POSReceiptGeneratorProps {
  transaction: Transaction;
  onClose: () => void;
  showCreditButton?: boolean;
  onViewCredit?: () => void;
}

const POSReceiptGenerator: React.FC<POSReceiptGeneratorProps> = ({
  transaction,
  onClose,
  showCreditButton = false,
  onViewCredit
}) => {
  const handlePrint = () => {
    // Clone the receipt content for printing
    const receiptContent = document.getElementById('receipt-content')?.cloneNode(true) as HTMLElement;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Add appropriate styles for printing
    const html = `
      <html>
        <head>
          <title>Receipt #${transaction.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; }
            .receipt { width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 10px; }
            .footer { text-align: center; margin-top: 10px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .flex { display: flex; justify-content: space-between; }
            .item-name { width: 60%; }
            .item-qty { width: 10%; text-align: center; }
            .item-price { width: 30%; text-align: right; }
            .total { font-weight: bold; margin-top: 10px; }
            .payment { margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            ${receiptContent.innerHTML}
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
    // For WhatsApp sharing, we'll create a message with receipt details
    const businessName = localStorage.getItem('businessData') 
      ? JSON.parse(localStorage.getItem('businessData') || '{}').businessName 
      : 'Our Business';
      
    const receiptDate = new Date(transaction.timestamp).toLocaleString();
    
    let message = `*RECEIPT from ${businessName}*\n`;
    message += `Receipt #: ${transaction.receiptNumber}\n`;
    message += `Date: ${receiptDate}\n\n`;
    message += `*ITEMS*\n`;
    
    transaction.items.forEach(item => {
      message += `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    message += `\n*TOTAL*: ${formatCurrency(transaction.total)}\n\n`;
    message += `Thank you for your business!`;
    
    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  // Get business name from localStorage
  const businessName = localStorage.getItem('businessData') 
    ? JSON.parse(localStorage.getItem('businessData') || '{}').businessName 
    : 'TellerPOS';
  
  const receiptDate = new Date(transaction.timestamp).toLocaleString();

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-center">Receipt #{transaction.receiptNumber}</AlertDialogTitle>
      </AlertDialogHeader>
      
      <div id="receipt-content" className="bg-white dark:bg-gray-950 p-4 my-4 rounded-lg border dark:border-gray-800 font-mono text-sm">
        <div className="text-center mb-4">
          <h3 className="font-bold">{businessName}</h3>
          <p className="text-xs text-gray-500">{receiptDate}</p>
        </div>
        
        <Separator className="my-2" />
        
        <div>
          <div className="flex justify-between font-semibold">
            <span className="w-1/2">Item</span>
            <span className="w-1/6 text-center">Qty</span>
            <span className="w-1/3 text-right">Price</span>
          </div>
          
          <Separator className="my-2" />
          
          {transaction.items.map((item, index) => (
            <div key={index} className="flex justify-between text-xs mb-1">
              <span className="w-1/2 truncate">{item.name}</span>
              <span className="w-1/6 text-center">{item.quantity}</span>
              <span className="w-1/3 text-right">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
          
          <Separator className="my-2" />
          
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
          
          <div className="mt-4">
            <p className="font-semibold">Payment Method:</p>
            {transaction.payments.map((payment, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span>{payment.method.replace('-', ' ').toUpperCase()}</span>
                <span>{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center text-xs">
            <p>Thank you for your business!</p>
            <p>Receipt #: {transaction.receiptNumber}</p>
          </div>
        </div>
      </div>
      
      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" className="flex-1" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" /> Print Receipt
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" /> Share via WhatsApp
        </Button>
        {showCreditButton && onViewCredit && (
          <Button variant="default" className="flex-1" onClick={onViewCredit}>
            <FileText className="mr-2 h-4 w-4" /> View Invoice
          </Button>
        )}
        {!showCreditButton && (
          <Button variant="default" className="flex-1" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        )}
      </AlertDialogFooter>
    </>
  );
};

export default POSReceiptGenerator;
