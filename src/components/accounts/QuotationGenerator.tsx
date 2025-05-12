
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Save, FileText, Share2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/types/pos';
import { Quotation } from '@/types/accounts';
import { Separator } from '@/components/ui/separator';
import { formatQuotationDate, getFormattedExpiryDate } from '@/components/pos/payment/transactionUtils';

interface QuotationGeneratorProps {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationGenerator: React.FC<QuotationGeneratorProps> = ({ quotation, onClose }) => {
  const quotationRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    const printContent = document.getElementById('quotation-content')?.cloneNode(true) as HTMLElement;
    if (!printContent) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Add appropriate styles for printing
    const html = `
      <html>
        <head>
          <title>Quotation #${quotation.quotationNumber}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              color: #333;
              font-size: 12px;
            }
            .quotation-container {
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
            }
            .quotation-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
              padding-bottom: 15px;
            }
            .company-info {
              text-align: left;
            }
            .quotation-title {
              text-align: right;
              color: #667799;
              font-size: 24px;
            }
            .quotation-details {
              text-align: right;
            }
            .quotation-details table {
              margin-left: auto;
              border-collapse: collapse;
            }
            .quotation-details td {
              border: 1px solid #ddd;
              padding: 5px 10px;
            }
            .customer-section {
              background-color: #f9f9f9;
              padding: 10px;
              margin-bottom: 20px;
            }
            .customer-header {
              background-color: #4b5682;
              color: white;
              padding: 5px 10px;
              font-weight: bold;
            }
            .customer-info {
              padding: 5px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              margin-bottom: 20px;
            }
            .items-table th {
              background-color: #4b5682;
              color: white;
              text-align: left;
              padding: 8px;
            }
            .items-table td {
              border-bottom: 1px solid #ddd;
              padding: 8px;
            }
            .items-table .amount {
              text-align: right;
            }
            .totals-section {
              margin-left: auto;
              width: 40%;
              margin-bottom: 20px;
            }
            .totals-table {
              width: 100%;
              border-collapse: collapse;
            }
            .totals-table td {
              padding: 5px;
            }
            .totals-table .label {
              text-align: right;
            }
            .totals-table .value {
              text-align: right;
              width: 100px;
            }
            .totals-table .total-row {
              font-weight: bold;
              border-top: 1px solid #000;
            }
            .terms-section {
              margin-top: 20px;
              border-top: 1px solid #eee;
              padding-top: 15px;
            }
            .terms-header {
              background-color: #4b5682;
              color: white;
              padding: 5px 10px;
              font-weight: bold;
            }
            .terms-content {
              padding: 10px 0;
            }
            .signature-section {
              margin-top: 30px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
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
  
  const handleSaveAsPDF = () => {
    // To be implemented - would use a PDF library
    console.log('Save as PDF functionality needs to be implemented');
  };
  
  const handleShare = () => {
    // Create WhatsApp share text
    const businessName = localStorage.getItem('businessData') 
      ? JSON.parse(localStorage.getItem('businessData') || '{}').businessName 
      : 'TellerPOS';
    
    let message = `*QUOTATION from ${businessName}*\n`;
    message += `Quotation #: ${quotation.quotationNumber}\n`;
    message += `Date: ${new Date(quotation.createdAt).toLocaleDateString()}\n`;
    message += `Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}\n`;
    message += `Customer: ${quotation.customerName}\n\n`;
    message += `*ITEMS*\n`;
    
    quotation.items.forEach(item => {
      message += `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}\n`;
    });
    
    message += `\n*TOTAL AMOUNT*: ${formatCurrency(quotation.total)}\n\n`;
    message += `Thank you for your business! This quote is valid until ${new Date(quotation.validUntil).toLocaleDateString()}.`;
    
    // Encode the message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank');
  };

  // Get business details from localStorage
  const businessData = localStorage.getItem('businessData') 
    ? JSON.parse(localStorage.getItem('businessData') || '{}')
    : { 
        businessName: 'TellerPOS', 
        businessAddress: '123 Business Street', 
        businessPhone: '000-000-0000',
        businessEmail: 'info@tellerpos.com',
        businessWebsite: 'www.tellerpos.com'
      };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quotation Preview</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={handleSaveAsPDF}>
            <Save className="mr-2 h-4 w-4" /> Save PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-md border shadow-sm max-h-[70vh] overflow-y-auto p-0">
        <div id="quotation-content" className="p-6 text-black" ref={quotationRef}>
          {/* Quotation Container */}
          <div className="quotation-container">
            {/* Header with Company Info and Quote Title */}
            <div className="quotation-header">
              <div className="company-info">
                <div className="flex items-center mb-2">
                  {businessData.businessLogo ? (
                    <img 
                      src={businessData.businessLogo} 
                      alt="Company Logo" 
                      className="w-12 h-12 mr-3" 
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded mr-3">
                      LOGO
                    </div>
                  )}
                  <h1 className="text-xl font-bold">{businessData.businessName}</h1>
                </div>
                <p>{businessData.businessAddress || '[Street Address]'}</p>
                <p>{businessData.businessCity || '[City, ST ZIP]'}</p>
                <p>Website: {businessData.businessWebsite || 'somedomain.com'}</p>
                <p>Phone: {businessData.businessPhone || '[000-000-0000]'}</p>
                <p>Fax: {businessData.businessFax || '[000-000-0000]'}</p>
                <p>Prepared by: {quotation.userId ? quotation.userId : '[salesperson name]'}</p>
              </div>
              
              <div className="quotation-right">
                <div className="quotation-title">QUOTE</div>
                <div className="quotation-details">
                  <table>
                    <tbody>
                      <tr>
                        <td>DATE</td>
                        <td>{new Date(quotation.createdAt).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td>QUOTE #</td>
                        <td>{quotation.quotationNumber}</td>
                      </tr>
                      <tr>
                        <td>CUSTOMER ID</td>
                        <td>{quotation.customerId || '[123]'}</td>
                      </tr>
                      <tr>
                        <td>VALID UNTIL</td>
                        <td>{new Date(quotation.validUntil).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Customer Section */}
            <div className="customer-section">
              <div className="customer-header">CUSTOMER</div>
              <div className="customer-info">
                <p className="font-bold">{quotation.customerName}</p>
                <p>{quotation.customerCompany || '[Company Name]'}</p>
                <p>{quotation.customerAddress || '[Street Address]'}</p>
                <p>{quotation.customerCity || '[City, ST ZIP]'}</p>
                <p>{quotation.customerPhone || '[Phone]'}</p>
              </div>
            </div>
            
            {/* Items Table */}
            <div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th className="w-1/2">DESCRIPTION</th>
                    <th className="text-right">UNIT PRICE</th>
                    <th className="text-right">QTY</th>
                    <th className="text-center">TAXED</th>
                    <th className="text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-center">{item.isTaxable ? 'X' : ''}</td>
                      <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                  {/* Add empty rows to match template */}
                  {Array.from({ length: Math.max(0, 10 - quotation.items.length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className="text-right">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="totals-section">
                <table className="totals-table">
                  <tbody>
                    <tr>
                      <td className="label">Subtotal</td>
                      <td className="value">$ {quotation.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="label">Taxable</td>
                      <td className="value">$ {(quotation.subtotal * 0.16).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="label">Tax rate</td>
                      <td className="value">16.0%</td>
                    </tr>
                    <tr>
                      <td className="label">Tax due</td>
                      <td className="value">$ {quotation.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="label">Other</td>
                      <td className="value">$ 0.00</td>
                    </tr>
                    <tr className="total-row">
                      <td className="label">TOTAL</td>
                      <td className="value">$ {quotation.total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="terms-section">
              <div className="terms-header">TERMS AND CONDITIONS</div>
              <div className="terms-content">
                <ol className="list-decimal ml-5 text-sm">
                  <li>Customer will be billed after indicating acceptance of this quote.</li>
                  <li>Payment will be due prior to delivery of service and goods.</li>
                  <li>Please sign and return the signed price quote to the address above.</li>
                </ol>
                <div className="signature-section mt-4">
                  <p className="italic">Customer Acceptance (sign below):</p>
                  <div className="mt-4 flex items-baseline">
                    <span className="border-b border-black flex-grow">X_______________________________</span>
                  </div>
                  <p className="mt-2">Print Name: _____________________________</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="footer">
              <p>If you have any questions about this price quote, please contact</p>
              <p>[Name, Phone #, E-mail]</p>
              <p className="mt-2 font-bold">Thank You For Your Business!</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handlePrint}>Print Quotation</Button>
      </div>
    </div>
  );
};

export default QuotationGenerator;
