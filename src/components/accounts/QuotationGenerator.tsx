
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Save, FileText, Share2, Percent, ToggleRight, ToggleLeft, PenLine } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/types/pos';
import { Quotation } from '@/types/accounts';
import { Separator } from '@/components/ui/separator';
import { formatQuotationDate, getFormattedExpiryDate } from '@/components/pos/payment/transactionUtils';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { loadBusinessSettings } from '@/utils/settingsUtils';

interface QuotationGeneratorProps {
  quotation: Quotation;
  onClose: () => void;
}

const QuotationGenerator: React.FC<QuotationGeneratorProps> = ({ quotation, onClose }) => {
  const quotationRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [signatureMode, setSignatureMode] = useState(false);
  const [penThickness, setPenThickness] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [enableTax, setEnableTax] = useState(true);
  const [enableDiscount, setEnablDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState(16); // Default VAT rate in Kenya (16%)
  const [taxAmount, setTaxAmount] = useState(quotation.tax);
  const [subtotal, setSubtotal] = useState(quotation.subtotal);
  const [total, setTotal] = useState(quotation.total);
  const [currency, setCurrency] = useState("KES"); // Default to Kenyan Shilling
  
  // Get business settings
  useEffect(() => {
    const businessSettings = loadBusinessSettings();
    if (businessSettings.currency) {
      setCurrency(businessSettings.currency);
    }
    
    // Initialize calculations
    recalculateTotals();
  }, []);
  
  // Recalculate totals when tax or discount settings change
  useEffect(() => {
    recalculateTotals();
  }, [enableTax, enableDiscount, discountPercent, taxRate]);
  
  const recalculateTotals = () => {
    const rawSubtotal = quotation.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calculate discount if enabled
    const discountValue = enableDiscount ? (rawSubtotal * discountPercent / 100) : 0;
    setDiscountAmount(discountValue);
    
    // Apply discount to get new subtotal
    const discountedSubtotal = rawSubtotal - discountValue;
    setSubtotal(discountedSubtotal);
    
    // Calculate tax if enabled
    const calculatedTax = enableTax ? (discountedSubtotal * taxRate / 100) : 0;
    setTaxAmount(calculatedTax);
    
    // Calculate final total
    setTotal(discountedSubtotal + calculatedTax);
  };
  
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
            .signatures-grid {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
            }
            .signature-box {
              border-top: 1px solid #000;
              width: 45%;
              text-align: center;
              padding-top: 5px;
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
    
    message += `\n*SUBTOTAL*: ${formatCurrency(subtotal)}\n`;
    
    if (enableDiscount && discountPercent > 0) {
      message += `*DISCOUNT (${discountPercent}%)*: ${formatCurrency(discountAmount)}\n`;
    }
    
    if (enableTax) {
      message += `*TAX (${taxRate}%)*: ${formatCurrency(taxAmount)}\n`;
    }
    
    message += `*TOTAL AMOUNT*: ${currency} ${formatCurrency(total)}\n\n`;
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

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    const x = e instanceof MouseEvent 
      ? e.clientX - rect.left
      : e.touches[0].clientX - rect.left;
    const y = e instanceof MouseEvent 
      ? e.clientY - rect.top 
      : e.touches[0].clientY - rect.top;
      
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get current position
    const rect = canvas.getBoundingClientRect();
    const x = e instanceof MouseEvent 
      ? e.clientX - rect.left
      : e.touches[0].clientX - rect.left;
    const y = e instanceof MouseEvent 
      ? e.clientY - rect.top 
      : e.touches[0].clientY - rect.top;
    
    ctx.lineWidth = penThickness;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing || !signatureCanvasRef.current) return;
    
    setIsDrawing(false);
    
    // Save the signature
    const canvas = signatureCanvasRef.current;
    setSignature(canvas.toDataURL('image/png'));
  };
  
  const clearSignature = () => {
    if (!signatureCanvasRef.current) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };
  
  const finishSignature = () => {
    setSignatureMode(false);
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
      
      {!signatureMode ? (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-wrap gap-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="flex items-center gap-2">
              <Label htmlFor="enableTax" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                {enableTax ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4" />}
                Enable Tax
              </Label>
              <Toggle
                id="enableTax"
                aria-label="Toggle tax"
                pressed={enableTax}
                onPressedChange={setEnableTax}
              />
            </div>
            
            {enableTax && (
              <div className="flex items-center gap-2">
                <Label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</Label>
                <div className="w-20">
                  <input 
                    id="taxRate"
                    type="number" 
                    min="0" 
                    max="100" 
                    value={taxRate} 
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Label htmlFor="enableDiscount" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                {enableDiscount ? <ToggleRight className="h-4 w-4 text-primary" /> : <ToggleLeft className="h-4 w-4" />}
                Enable Discount
              </Label>
              <Toggle
                id="enableDiscount"
                aria-label="Toggle discount"
                pressed={enableDiscount}
                onPressedChange={setEnablDiscount}
              />
            </div>
            
            {enableDiscount && (
              <div className="flex items-center gap-2">
                <Label htmlFor="discountPercent" className="text-sm font-medium">Discount (%)</Label>
                <div className="w-20">
                  <input 
                    id="discountPercent"
                    type="number" 
                    min="0" 
                    max="100" 
                    value={discountPercent} 
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)} 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setSignatureMode(true)}
                className="flex items-center"
              >
                <PenLine className="mr-2 h-4 w-4" /> Add Signature
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
                    <p>Prepared by: {quotation.userId || '[salesperson name]'}</p>
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
                          <td className="value">{currency} {subtotal.toFixed(2)}</td>
                        </tr>
                        
                        {enableDiscount && discountPercent > 0 && (
                          <tr>
                            <td className="label">Discount ({discountPercent}%)</td>
                            <td className="value">- {currency} {discountAmount.toFixed(2)}</td>
                          </tr>
                        )}
                        
                        {enableTax && (
                          <>
                            <tr>
                              <td className="label">Taxable</td>
                              <td className="value">{currency} {subtotal.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td className="label">Tax rate</td>
                              <td className="value">{taxRate.toFixed(1)}%</td>
                            </tr>
                            <tr>
                              <td className="label">Tax due</td>
                              <td className="value">{currency} {taxAmount.toFixed(2)}</td>
                            </tr>
                          </>
                        )}
                        
                        <tr className="total-row">
                          <td className="label">TOTAL</td>
                          <td className="value">{currency} {total.toFixed(2)}</td>
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
                    
                    {/* Signature section */}
                    <div className="signatures-grid">
                      <div className="signature-box">
                        <div className="h-16 flex items-end justify-center">
                          {businessData.signature && (
                            <img 
                              src={businessData.signature} 
                              alt="Authorized Signature" 
                              className="max-h-16" 
                            />
                          )}
                        </div>
                        <p className="text-sm">Authorized Signature</p>
                      </div>
                      
                      <div className="signature-box">
                        <div className="h-16 flex items-end justify-center">
                          {signature && (
                            <img 
                              src={signature} 
                              alt="Customer Signature" 
                              className="max-h-16" 
                            />
                          )}
                        </div>
                        <p className="text-sm">Customer Signature</p>
                      </div>
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
      ) : (
        // Signature mode
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold mb-2">Add Your Signature</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Use your mouse or touch screen to sign below
          </p>
          
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="penThickness" className="min-w-24">Pen Thickness</Label>
              <Slider
                id="penThickness"
                min={1}
                max={10}
                step={1}
                value={[penThickness]}
                onValueChange={(values) => setPenThickness(values[0])}
                className="w-[180px]"
              />
              <span className="text-sm">{penThickness}px</span>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <canvas
                ref={signatureCanvasRef}
                width={600}
                height={200}
                className="bg-white w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={clearSignature}>Clear</Button>
              <Button variant="outline" onClick={() => setSignatureMode(false)}>Cancel</Button>
              <Button onClick={finishSignature} disabled={!signature}>Apply Signature</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationGenerator;
