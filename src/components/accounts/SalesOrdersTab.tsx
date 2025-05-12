import React, { useState, useEffect } from 'react';
import { SalesOrder, SalesOrderStatus } from '@/types/accounts';
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
import { FileText, Plus, Search, FileUp, Download } from 'lucide-react';
import { nanoid } from 'nanoid';
import { toast } from '@/hooks/use-toast';
import { CartItem } from '@/types/pos';

const SalesOrdersTab: React.FC = () => {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<SalesOrder>>({
    orderNumber: `SO-${nanoid(8).toUpperCase()}`,
    customerName: '',
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft',
    notes: '',
  });
  const [inventory, setInventory] = useState<CartItem[]>([]);
  
  useEffect(() => {
    // Load sales orders from localStorage
    const storedOrders = localStorage.getItem('salesOrders');
    if (storedOrders) {
      setSalesOrders(JSON.parse(storedOrders));
      setFilteredOrders(JSON.parse(storedOrders));
    }
    
    // Load inventory
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory).map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        type: item.type
      })));
    }
  }, []);
  
  useEffect(() => {
    // Filter orders based on search query
    if (searchQuery) {
      const filtered = salesOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(salesOrders);
    }
  }, [searchQuery, salesOrders]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCreateOrder = () => {
    if (!newOrder.customerName) {
      toast({
        title: "Missing information",
        description: "Please enter a customer name",
        variant: "destructive",
      });
      return;
    }
    
    if (!newOrder.items || newOrder.items.length === 0) {
      toast({
        title: "Empty order",
        description: "Please add at least one item to the order",
        variant: "destructive",
      });
      return;
    }
    
    const createdAt = new Date().toISOString();
    
    const order: SalesOrder = {
      id: nanoid(),
      orderNumber: newOrder.orderNumber || `SO-${nanoid(8).toUpperCase()}`,
      customerId: nanoid(), // In a real app, this would be selected from customers
      customerName: newOrder.customerName || 'Guest',
      items: newOrder.items || [],
      subtotal: newOrder.subtotal || 0,
      tax: newOrder.tax || 0,
      total: newOrder.total || 0,
      status: 'pending',
      createdAt,
      updatedAt: createdAt,
      notes: newOrder.notes,
      userId: "current-user-id" // In a real app, this would come from auth context
    };
    
    // Add order to state
    setSalesOrders(prev => [order, ...prev]);
    
    // Save to localStorage
    const updatedOrders = [order, ...salesOrders];
    localStorage.setItem('salesOrders', JSON.stringify(updatedOrders));
    
    // Reset form
    setNewOrder({
      orderNumber: `SO-${nanoid(8).toUpperCase()}`,
      customerName: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      notes: '',
    });
    
    setIsOpen(false);
    
    toast({
      title: "Sales order created",
      description: `Order ${order.orderNumber} has been created successfully.`,
    });
  };
  
  const addItemToOrder = (item: CartItem) => {
    // Check if item already exists in order
    const existingItemIndex = newOrder.items?.findIndex(i => i.id === item.id);
    
    if (existingItemIndex !== undefined && existingItemIndex >= 0 && newOrder.items) {
      // Update existing item quantity
      const updatedItems = [...newOrder.items];
      const existingItem = updatedItems[existingItemIndex];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + 1,
        total: existingItem.price * (existingItem.quantity + 1)
      };
      
      // Recalculate totals
      const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const tax = subtotal * 0.16; // 16% VAT
      
      setNewOrder({
        ...newOrder,
        items: updatedItems,
        subtotal,
        tax,
        total: subtotal + tax
      });
    } else {
      // Add new item
      const newItem = {
        id: item.id,
        name: item.name,
        quantity: 1,
        price: item.price,
        total: item.price // Calculate the total for the item
      };
      
      const updatedItems = [...(newOrder.items || []), newItem];
      
      // Calculate totals
      const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
      const tax = subtotal * 0.16; // 16% VAT
      
      setNewOrder({
        ...newOrder,
        items: updatedItems,
        subtotal,
        tax,
        total: subtotal + tax
      });
    }
  };
  
  const removeItemFromOrder = (itemId: string) => {
    if (!newOrder.items) return;
    
    const updatedItems = newOrder.items.filter(i => i.id !== itemId);
    
    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = subtotal * 0.16; // 16% VAT
    
    setNewOrder({
      ...newOrder,
      items: updatedItems,
      subtotal,
      tax,
      total: subtotal + tax
    });
  };
  
  const getStatusBadge = (status: SalesOrderStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-blue-500">Approved</Badge>;
      case 'fulfilled':
        return <Badge variant="default" className="bg-green-500">Fulfilled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const changeOrderStatus = (orderId: string, status: SalesOrderStatus) => {
    const updatedOrders = salesOrders.map(order => 
      order.id === orderId 
        ? { ...order, status, updatedAt: new Date().toISOString() } 
        : order
    );
    
    setSalesOrders(updatedOrders);
    localStorage.setItem('salesOrders', JSON.stringify(updatedOrders));
    
    toast({
      title: "Status updated",
      description: `Order status changed to ${status}`,
    });
  };
  
  const exportOrder = (order: SalesOrder) => {
    const orderData = {
      orderDetails: {
        orderNumber: order.orderNumber,
        date: new Date(order.createdAt).toLocaleDateString(),
        customer: order.customerName,
        status: order.status,
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      summary: {
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
      },
      notes: order.notes,
    };
    
    // Create JSON file and trigger download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orderData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${order.orderNumber}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by number or customer..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Sales Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Sales Order</DialogTitle>
              <DialogDescription>
                Create a new sales order for a customer.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Order #</label>
                <Input 
                  className="col-span-3"
                  value={newOrder.orderNumber}
                  onChange={(e) => setNewOrder({...newOrder, orderNumber: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Customer</label>
                <Input 
                  className="col-span-3"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                  placeholder="Enter customer name"
                />
              </div>
              
              <div className="border rounded-md p-4 mt-2">
                <h3 className="font-medium mb-2">Order Items</h3>
                
                {newOrder.items && newOrder.items.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {newOrder.items.map((item, idx) => (
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
                            onClick={() => removeItemFromOrder(item.id)}
                            className="h-8 w-8 text-red-500"
                          >
                            <FileUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2 space-y-1 text-right">
                      <p className="text-sm">Subtotal: {formatCurrency(newOrder.subtotal || 0)}</p>
                      <p className="text-sm">Tax (16%): {formatCurrency(newOrder.tax || 0)}</p>
                      <p className="font-bold">Total: {formatCurrency(newOrder.total || 0)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added to this order yet
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Add Items from Inventory</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto">
                    {inventory.slice(0, 6).map((item) => (
                      <Button 
                        key={item.id} 
                        variant="outline" 
                        className="h-auto py-2 px-3 justify-start"
                        onClick={() => addItemToOrder(item)}
                      >
                        <div className="text-left">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs">{formatCurrency(item.price)}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">Notes</label>
                <textarea 
                  className="col-span-3 border rounded-md p-2"
                  value={newOrder.notes || ''}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  placeholder="Add any special instructions or notes"
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" onClick={handleCreateOrder}>Create Sales Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {filteredOrders.length > 0 ? (
        <Table>
          <TableCaption>A list of all your sales orders.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => exportOrder(order)}>
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
                          <DialogTitle>Sales Order: {order.orderNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="py-2">
                          <div className="flex justify-between mb-4">
                            <div>
                              <p className="font-medium">Customer</p>
                              <p className="text-sm">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Date</p>
                              <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
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
                                {order.items.map((item, idx) => (
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
                            <p className="text-sm">Subtotal: {formatCurrency(order.subtotal)}</p>
                            <p className="text-sm">Tax: {formatCurrency(order.tax)}</p>
                            <p className="font-bold">Total: {formatCurrency(order.total)}</p>
                          </div>
                          
                          {order.notes && (
                            <div className="border-t pt-2">
                              <p className="text-sm font-medium">Notes</p>
                              <p className="text-sm">{order.notes}</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter className="border-t pt-4">
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                className="mr-2"
                                onClick={() => changeOrderStatus(order.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                              <Button onClick={() => changeOrderStatus(order.id, 'approved')}>
                                Approve
                              </Button>
                            </>
                          )}
                          {order.status === 'approved' && (
                            <Button onClick={() => changeOrderStatus(order.id, 'fulfilled')}>
                              Mark as Fulfilled
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
            <CardTitle>No Sales Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-lg font-medium">No sales orders found</p>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search query" : "Create your first sales order to get started"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesOrdersTab;
