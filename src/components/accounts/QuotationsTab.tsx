import React, { useState, useEffect } from 'react';
import { Quotation, QuotationStatus } from '@/types/accounts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { FileText, Plus, Search, FileUp, Download, Calendar, ShoppingCart, Package2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { toast } from '@/hooks/use-toast';
import { CartItem } from '@/types/pos';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import QuotationGenerator from './QuotationGenerator';
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { InventoryItem, Product, Service } from '@/types/inventory';

const QuotationsTab: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<InventoryItem[]>([]);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newQuotation, setNewQuotation] = useState<Partial<Quotation>>({
    quotationNumber: `QT-${nanoid(8).toUpperCase()}`,
    customerName: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    validUntil: addDays(new Date(), 30).toISOString(), // Valid for 30 days
    notes: '',
  });
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null);
  const [showQuotationPreview, setShowQuotationPreview] = useState(false);

  useEffect(() => {
    // Load quotations from localStorage
    const storedQuotations = localStorage.getItem('quotations');
    if (storedQuotations) {
      setQuotations(JSON.parse(storedQuotations));
      setFilteredQuotations(JSON.parse(storedQuotations));
    }

    // Load inventory
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      const parsedInventory = JSON.parse(storedInventory);
      setInventoryItems(parsedInventory);
      setFilteredInventoryItems(parsedInventory);
    }
  }, []);

  useEffect(() => {
    // Filter quotations based on search query
    if (searchQuery) {
      const filtered = quotations.filter(quotation =>
        quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quotation.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuotations(filtered);
    } else {
      setFilteredQuotations(quotations);
    }
  }, [searchQuery, quotations]);

  // Filter inventory items based on search query
  useEffect(() => {
    if (inventorySearchQuery) {
      const filtered = inventoryItems.filter(item =>
        item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(inventorySearchQuery.toLowerCase())
      );
      setFilteredInventoryItems(filtered);
    } else {
      setFilteredInventoryItems(inventoryItems);
    }
  }, [inventorySearchQuery, inventoryItems]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInventorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInventorySearchQuery(e.target.value);
  };

  const handleValidUntilChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setNewQuotation({
        ...newQuotation,
        validUntil: date.toISOString()
      });
    }
  };

  const handleCreateQuotation = () => {
    if (!newQuotation.customerName) {
      toast({
        title: "Missing information",
        description: "Please enter a customer name",
        variant: "destructive",
      });
      return;
    }

    if (!newQuotation.items || newQuotation.items.length === 0) {
      toast({
        title: "Empty quotation",
        description: "Please add at least one item to the quotation",
        variant: "destructive",
      });
      return;
    }

    const createdAt = new Date().toISOString();

    const quotation: Quotation = {
      id: nanoid(),
      quotationNumber: newQuotation.quotationNumber || `QT-${nanoid(8).toUpperCase()}`,
      customerId: nanoid(), // In a real app, this would be selected from customers
      customerName: newQuotation.customerName || 'Guest',
      customerCompany: newQuotation.customerCompany || '',
      customerAddress: newQuotation.customerAddress || '',
      customerCity: newQuotation.customerCity || '',
      customerPhone: newQuotation.customerPhone || '',
      items: newQuotation.items || [],
      subtotal: newQuotation.subtotal || 0,
      tax: newQuotation.tax || 0,
      total: newQuotation.total || 0,
      status: 'draft',
      validUntil: newQuotation.validUntil || addDays(new Date(), 30).toISOString(),
      createdAt,
      updatedAt: createdAt,
      notes: newQuotation.notes,
      userId: "current-user-id" // In a real app, this would come from auth context
    };

    // Add quotation to state
    setQuotations(prev => [quotation, ...prev]);

    // Save to localStorage
    const updatedQuotations = [quotation, ...quotations];
    localStorage.setItem('quotations', JSON.stringify(updatedQuotations));

    // Reset form
    setNewQuotation({
      quotationNumber: `QT-${nanoid(8).toUpperCase()}`,
      customerName: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      validUntil: addDays(new Date(), 30).toISOString(),
      notes: '',
    });
    setDate(new Date());
    setInventorySearchQuery('');

    setIsOpen(false);

    toast({
      title: "Quotation created",
      description: `Quotation ${quotation.quotationNumber} has been created successfully.`,
    });
  };

  const addItemToQuotation = (inventoryItem: InventoryItem) => {
    // Check if item already exists in quotation
    const existingItemIndex = newQuotation.items?.findIndex(i => i.id === inventoryItem.id);
    
    // Prepare the item from inventory data
    const cartItem: CartItem = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      price: inventoryItem.price,
      quantity: 1,
      total: inventoryItem.price,
      type: inventoryItem.type,
      isTaxable: true,
      imageUrl: inventoryItem.imageUrl,
      color: inventoryItem.color as string,
    };

    if (existingItemIndex !== undefined && existingItemIndex >= 0 && newQuotation.items) {
      // Update existing item quantity
      const updatedItems = [...newQuotation.items];
      const existingItem = updatedItems[existingItemIndex];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
        total: existingItem.price * (existingItem.quantity + 1)
      };

      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const tax = subtotal * 0.16; // 16% VAT

      setNewQuotation({
        ...newQuotation,
        items: updatedItems,
        subtotal,
        tax,
        total: subtotal + tax
      });
    } else {
      // Add new item
      const newItem = {
        ...cartItem,
        total: cartItem.price * cartItem.quantity
      };

      const updatedItems = [...(newQuotation.items || []), newItem];

      // Calculate totals
      const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const tax = subtotal * 0.16; // 16% VAT

      setNewQuotation({
        ...newQuotation,
        items: updatedItems,
        subtotal,
        tax,
        total: subtotal + tax
      });
    }
    
    // Clear the search after adding
    setInventorySearchQuery('');
  };

  const removeItemFromQuotation = (itemId: string) => {
    if (!newQuotation.items) return;

    const updatedItems = newQuotation.items.filter(i => i.id !== itemId);

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.16; // 16% VAT

    setNewQuotation({
      ...newQuotation,
      items: updatedItems,
      subtotal,
      tax,
      total: subtotal + tax
    });
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="default" className="bg-orange-500">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const changeQuotationStatus = (quotationId: string, status: QuotationStatus) => {
    const updatedQuotations = quotations.map(quotation =>
      quotation.id === quotationId
        ? { ...quotation, status, updatedAt: new Date().toISOString() }
        : quotation
    );

    setQuotations(updatedQuotations);
    localStorage.setItem('quotations', JSON.stringify(updatedQuotations));

    toast({
      title: "Status updated",
      description: `Quotation status changed to ${status}`,
    });
  };

  const exportQuotation = (quotation: Quotation) => {
    const quotationData = {
      quotationDetails: {
        quotationNumber: quotation.quotationNumber,
        date: new Date(quotation.createdAt).toLocaleDateString(),
        customer: quotation.customerName,
        status: quotation.status,
        validUntil: new Date(quotation.validUntil).toLocaleDateString(),
      },
      items: quotation.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      summary: {
        subtotal: quotation.subtotal,
        tax: quotation.tax,
        total: quotation.total,
      },
      notes: quotation.notes,
    };

    // Create JSON file and trigger download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quotationData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${quotation.quotationNumber}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const convertToSalesOrder = (quotation: Quotation) => {
    // Get existing sales orders
    const storedOrders = localStorage.getItem('salesOrders') || '[]';
    const salesOrders = JSON.parse(storedOrders);
    
    // Create new sales order from quotation
    const salesOrder = {
      id: nanoid(),
      orderNumber: `SO-${nanoid(8).toUpperCase()}`,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      items: quotation.items,
      subtotal: quotation.subtotal,
      tax: quotation.tax,
      total: quotation.total,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Converted from Quotation ${quotation.quotationNumber}. ${quotation.notes || ''}`,
      userId: quotation.userId,
    };
    
    // Save updated sales orders
    const updatedSalesOrders = [salesOrder, ...salesOrders];
    localStorage.setItem('salesOrders', JSON.stringify(updatedSalesOrders));
    
    // Update quotation status
    changeQuotationStatus(quotation.id, 'accepted');
    
    toast({
      title: "Converted to Sales Order",
      description: `Quotation converted to Sales Order #${salesOrder.orderNumber}`,
    });
  };

  const viewQuotationDetails = (quotation: Quotation) => {
    setViewQuotation(quotation);
    setShowQuotationPreview(true);
  };

  // Helper to render inventory item visual
  const renderItemVisual = (item: InventoryItem) => {
    if (item.imageUrl) {
      return <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-cover rounded" />;
    } else if (item.color) {
      const colorMap: Record<string, string> = {
        red: 'bg-red-500',
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        purple: 'bg-purple-500'
      };
      return <div className={`w-8 h-8 ${colorMap[item.color]} rounded flex items-center justify-center`}>
        {item.type === 'product' ? <Package2 className="w-4 h-4 text-white opacity-50" /> : <FileText className="w-4 h-4 text-white opacity-50" />}
      </div>;
    }

    // Fallback
    return <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
      {item.type === 'product' ? <Package2 className="w-4 h-4 text-gray-400" /> : <FileText className="w-4 h-4 text-gray-400" />}
    </div>;
  };

  // Helper to check if a product is in stock
  const isInStock = (item: InventoryItem): boolean => {
    if (item.type === 'product') {
      return (item as Product).stock > 0;
    } 
    return (item as Service).isAvailable;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations by number or customer..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Quotation</DialogTitle>
              <DialogDescription>
                Create a new price quotation for a customer.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Quotation #</label>
                <Input
                  className="col-span-3"
                  value={newQuotation.quotationNumber}
                  onChange={(e) => setNewQuotation({ ...newQuotation, quotationNumber: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Customer</label>
                <Input
                  className="col-span-3"
                  value={newQuotation.customerName}
                  onChange={(e) => setNewQuotation({ ...newQuotation, customerName: e.target.value })}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Customer Company</label>
                <Input
                  className="col-span-3"
                  value={newQuotation.customerCompany || ''}
                  onChange={(e) => setNewQuotation({ ...newQuotation, customerCompany: e.target.value })}
                  placeholder="Enter customer company name (optional)"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Customer Address</label>
                <Input
                  className="col-span-3"
                  value={newQuotation.customerAddress || ''}
                  onChange={(e) => setNewQuotation({ ...newQuotation, customerAddress: e.target.value })}
                  placeholder="Enter customer address (optional)"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Customer City/State</label>
                <Input
                  className="col-span-3"
                  value={newQuotation.customerCity || ''}
                  onChange={(e) => setNewQuotation({ ...newQuotation, customerCity: e.target.value })}
                  placeholder="Enter city, state, zip (optional)"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Customer Phone</label>
                <Input
                  className="col-span-3"
                  value={newQuotation.customerPhone || ''}
                  onChange={(e) => setNewQuotation({ ...newQuotation, customerPhone: e.target.value })}
                  placeholder="Enter customer phone (optional)"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Valid Until</label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={handleValidUntilChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="border rounded-md p-4 mt-2">
                <h3 className="font-medium mb-2">Quotation Items</h3>

                {newQuotation.items && newQuotation.items.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {newQuotation.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="font-medium mr-4">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItemFromQuotation(item.id)}
                            className="h-8 w-8 text-red-500"
                          >
                            <FileUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 space-y-1 text-right">
                      <p className="text-sm">Subtotal: {formatCurrency(newQuotation.subtotal || 0)}</p>
                      <p className="text-sm">Tax (16%): {formatCurrency(newQuotation.tax || 0)}</p>
                      <p className="font-bold">Total: {formatCurrency(newQuotation.total || 0)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added to this quotation yet
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Add Items from Inventory</h4>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory items..."
                      className="pl-8"
                      value={inventorySearchQuery}
                      onChange={handleInventorySearch}
                    />
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="text-left text-xs font-medium p-2">Item</th>
                          <th className="text-right text-xs font-medium p-2">Price</th>
                          <th className="text-right text-xs font-medium p-2 w-20">Stock</th>
                          <th className="text-right text-xs font-medium p-2 w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredInventoryItems.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                              No items found
                            </td>
                          </tr>
                        ) : (
                          filteredInventoryItems.map(item => (
                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                              <td className="p-2">
                                <div className="flex items-center">
                                  {renderItemVisual(item)}
                                  <div className="ml-2">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 text-right text-sm">{formatCurrency(item.price)}</td>
                              <td className="p-2 text-right">
                                <Badge variant={isInStock(item) ? "outline" : "destructive"} className="text-xs">
                                  {item.type === 'product' 
                                    ? `${(item as Product).stock} left` 
                                    : (item as Service).isAvailable 
                                      ? "Available" 
                                      : "Unavailable"}
                                </Badge>
                              </td>
                              <td className="p-2 text-right">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => addItemToQuotation(item)}
                                  disabled={!isInStock(item)}
                                  className="h-7 w-7 p-0"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Notes</label>
                <textarea
                  className="col-span-3 border rounded-md p-2"
                  value={newQuotation.notes || ''}
                  onChange={(e) => setNewQuotation({ ...newQuotation, notes: e.target.value })}
                  placeholder="Add any special instructions or notes"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" onClick={handleCreateQuotation}>Create Quotation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filteredQuotations.length > 0 ? (
        <Table>
          <TableCaption>A list of all your quotations.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Quotation #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell className="font-medium">{quotation.quotationNumber}</TableCell>
                <TableCell>{new Date(quotation.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{quotation.customerName}</TableCell>
                <TableCell>{new Date(quotation.validUntil).toLocaleDateString()}</TableCell>
                <TableCell>
                  {getStatusBadge(quotation.status)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(quotation.total)}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title="View Quotation" 
                      onClick={() => viewQuotationDetails(quotation)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      title="Export Quotation"
                      onClick={() => exportQuotation(quotation)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Quotation: {quotation.quotationNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                          <div className="flex justify-between mb-4">
                            <div>
                              <p className="font-medium">Customer</p>
                              <p className="text-sm">{quotation.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Valid Until</p>
                              <p className="text-sm">{new Date(quotation.validUntil).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="border rounded-md p-2 mb-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-1">Item</th>
                                  <th className="text-right p-1">Qty</th>
                                  <th className="text-right p-1">Price</th>
                                  <th className="text-right p-1">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {quotation.items.map((item, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="p-1">{item.name}</td>
                                    <td className="text-right p-1">{item.quantity}</td>
                                    <td className="text-right p-1">{formatCurrency(item.price)}</td>
                                    <td className="text-right p-1">{formatCurrency(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="text-right space-y-1 mb-4">
                            <p className="text-sm">Subtotal: {formatCurrency(quotation.subtotal)}</p>
                            <p className="text-sm">Tax: {formatCurrency(quotation.tax)}</p>
                            <p className="font-bold">Total: {formatCurrency(quotation.total)}</p>
                          </div>

                          {quotation.notes && (
                            <div className="border-t pt-2">
                              <p className="text-sm font-medium">Notes</p>
                              <p className="text-sm">{quotation.notes}</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter className="border-t pt-4">
                          {quotation.status === 'draft' && (
                            <>
                              <Button
                                variant="outline"
                                className="mr-2"
                                onClick={() => changeQuotationStatus(quotation.id, 'sent')}
                              >
                                Mark as Sent
                              </Button>
                              <Button
                                onClick={() => changeQuotationStatus(quotation.id, 'rejected')}
                                variant="destructive"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {(quotation.status === 'draft' || quotation.status === 'sent') && (
                            <Button onClick={() => convertToSalesOrder(quotation)}>
                              Convert to Sales Order
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-lg font-medium">No quotations found</p>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search query" : "Create your first quotation to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Quotation Preview Dialog */}
      <AlertDialog 
        open={showQuotationPreview} 
        onOpenChange={setShowQuotationPreview}
      >
        <AlertDialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0">
          {viewQuotation && (
            <QuotationGenerator 
              quotation={viewQuotation}
              onClose={() => setShowQuotationPreview(false)}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuotationsTab;
