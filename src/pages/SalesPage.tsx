
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Transaction } from '@/types/pos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import POSReceiptGenerator from "@/components/pos/POSReceiptGenerator";
import POSInvoiceGenerator from "@/components/pos/POSInvoiceGenerator";
import { 
  Search, FileText, Receipt, ArrowUpDown, Calendar as CalendarIcon, 
  Grid, List, Filter, Download, Edit, AlertCircle, Check, FileSearchIcon
} from "lucide-react";
import { format } from "date-fns";

const SalesPage = () => {
  // States for data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // States for UI
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showEditStatusDialog, setShowEditStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'completed' | 'cancelled' | 'paid'>('pending');
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  
  // States for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [customerFilter, setCustomerFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState<{ min: string, max: string }>({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      // Update transactions with customerName if available
      const updatedTransactions = parsedTransactions.map((transaction: Transaction) => {
        if (transaction.customerId && !transaction.customerName) {
          const storedCustomers = localStorage.getItem('customers');
          if (storedCustomers) {
            const customers = JSON.parse(storedCustomers);
            const customer = customers.find((c: any) => c.id === transaction.customerId);
            if (customer) {
              return { ...transaction, customerName: customer.name };
            }
          }
        }
        return transaction;
      });
      
      setTransactions(updatedTransactions);
    }
  }, []);

  // Filter and sort transactions
  useEffect(() => {
    let filtered = [...transactions];
    
    // Filter by tab
    if (activeTab === 'receipts') {
      filtered = filtered.filter(transaction => !transaction.isInvoice);
    } else if (activeTab === 'invoices') {
      filtered = filtered.filter(transaction => transaction.isInvoice);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.receiptNumber.toLowerCase().includes(query) ||
        transaction.items.some(item => item.name.toLowerCase().includes(query)) ||
        (transaction.customerName && transaction.customerName.toLowerCase().includes(query))
      );
    }
    
    // Filter by customer name
    if (customerFilter) {
      filtered = filtered.filter(transaction => 
        transaction.customerName && transaction.customerName.toLowerCase().includes(customerFilter.toLowerCase())
      );
    }
    
    // Filter by amount range
    if (amountFilter.min || amountFilter.max) {
      filtered = filtered.filter(transaction => {
        const amount = transaction.total;
        const minAmount = amountFilter.min ? parseFloat(amountFilter.min) : 0;
        const maxAmount = amountFilter.max ? parseFloat(amountFilter.max) : Infinity;
        return amount >= minAmount && amount <= maxAmount;
      });
    }
    
    // Filter by date range
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        const fromDate = dateRange.from ? new Date(dateRange.from) : new Date(0);
        const toDate = dateRange.to ? new Date(dateRange.to) : new Date(8640000000000000);
        
        // Set hours to compare only dates
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        
        return transactionDate >= fromDate && transactionDate <= toDate;
      });
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, sortOrder, activeTab, customerFilter, amountFilter, dateRange]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
    // Load customer name if it's an invoice
    if (transaction.customerId) {
      if (transaction.customerName) {
        setCustomerName(transaction.customerName);
      } else {
        const storedCustomers = localStorage.getItem('customers');
        if (storedCustomers) {
          const customers = JSON.parse(storedCustomers);
          const customer = customers.find((c: any) => c.id === transaction.customerId);
          if (customer) {
            setCustomerName(customer.name);
          }
        }
      }
    }
    
    if (transaction.isInvoice) {
      setShowInvoiceDialog(true);
    } else {
      setShowReceiptDialog(true);
    }
  };
  
  const handleEditStatus = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNewStatus(transaction.status);
    setShowEditStatusDialog(true);
  };
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowConfirmDeleteDialog(true);
  };
  
  const confirmUpdateStatus = () => {
    if (!selectedTransaction || !newStatus) return;
    
    const updatedTransaction = { ...selectedTransaction, status: newStatus };
    const updatedTransactions = transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    );
    
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setShowEditStatusDialog(false);
  };
  
  const confirmDeleteTransaction = () => {
    if (!selectedTransaction) return;
    
    const updatedTransactions = transactions.filter(t => t.id !== selectedTransaction.id);
    setTransactions(updatedTransactions);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    setShowConfirmDeleteDialog(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP p');
  };
  
  const exportData = (type: 'csv' | 'pdf') => {
    // For simplicity, we'll implement CSV export functionality
    if (type === 'csv') {
      const headers = [
        'ID', 'Type', 'Receipt/Invoice #', 'Date', 'Customer', 
        'Total Amount', 'Paid Amount', 'Balance', 'Status'
      ];
      
      const csvData = filteredTransactions.map(t => [
        t.id,
        t.isInvoice ? 'Invoice' : 'Receipt',
        t.receiptNumber,
        formatDate(t.timestamp),
        t.customerName || 'Walk-in Customer',
        t.total,
        t.paidAmount || t.total,
        t.isInvoice ? t.total : 0,
        t.status
      ]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      csvData.forEach(row => {
        csvContent += row.join(',') + '\n';
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('PDF export is not implemented in this version');
    }
  };

  const getTotalSales = () => {
    return transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  };

  const getReceiptCount = () => {
    return transactions.filter(transaction => !transaction.isInvoice).length;
  };

  const getInvoiceCount = () => {
    return transactions.filter(transaction => transaction.isInvoice).length;
  };
  
  const getPendingAmount = () => {
    return transactions
      .filter(transaction => transaction.isInvoice && transaction.status !== 'paid')
      .reduce((sum, transaction) => sum + transaction.total, 0);
  };

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalSales())}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getReceiptCount()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getInvoiceCount()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getPendingAmount())}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by receipt/invoice number, item or customer..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Sales</h4>
                  
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Date Range</h5>
                    <div className="grid gap-2">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          From
                          {dateRange.from && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-auto p-0 font-normal" 
                              onClick={() => setDateRange(prev => ({ ...prev, from: undefined }))}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.from ? format(dateRange.from, 'PPP') : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          To
                          {dateRange.to && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-auto p-0 font-normal" 
                              onClick={() => setDateRange(prev => ({ ...prev, to: undefined }))}
                            >
                              Clear
                            </Button>
                          )}
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.to ? format(dateRange.to, 'PPP') : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Name</label>
                    <Input
                      placeholder="Filter by customer"
                      value={customerFilter}
                      onChange={e => setCustomerFilter(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={amountFilter.min}
                        onChange={e => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={amountFilter.max}
                        onChange={e => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateRange({ from: undefined, to: undefined });
                        setCustomerFilter('');
                        setAmountFilter({ min: '', max: '' });
                      }}
                    >
                      Reset
                    </Button>
                    <Button onClick={() => setShowFilters(false)}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => exportData('csv')} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTransactions.map(transaction => (
                      <Card key={transaction.id} className="overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2 text-base">
                                {transaction.isInvoice ? (
                                  <FileText className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <Receipt className="h-4 w-4 text-green-500" />
                                )}
                                {transaction.receiptNumber}
                              </CardTitle>
                              <CardDescription>
                                <CalendarIcon className="inline h-3 w-3 mr-1" />
                                {formatDate(transaction.timestamp)}
                              </CardDescription>
                            </div>
                            <Badge variant={transaction.isInvoice ? "outline" : "default"} className={
                              transaction.status === 'completed' ? "bg-green-500" :
                              transaction.status === 'paid' ? "bg-green-500" :
                              transaction.status === 'cancelled' ? "bg-red-500" :
                              "bg-yellow-500"
                            }>
                              {transaction.isInvoice ? 'Invoice' : 'Receipt'} • {transaction.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pb-2">
                          {transaction.customerName && (
                            <div className="mb-2 text-sm italic">
                              Customer: {transaction.customerName}
                            </div>
                          )}
                          <div className="text-sm space-y-1 max-h-24 overflow-y-auto">
                            {transaction.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="truncate">{item.name} x{item.quantity}</span>
                                <span className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                        
                        <CardFooter className="flex justify-between pt-2 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {transaction.payments.map(p => p.method.replace('-', ' ')).join(', ')}
                            </p>
                            <p className="font-bold">{formatCurrency(transaction.total)}</p>
                            {transaction.paidAmount > 0 && (
                              <p className="text-xs text-green-600">Paid: {formatCurrency(transaction.paidAmount)}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {transaction.isInvoice && (
                              <Button variant="outline" size="sm" onClick={() => handleEditStatus(transaction)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="outline" onClick={() => handleViewTransaction(transaction)}>
                              <FileSearchIcon className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Number</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map(transaction => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center">
                                {transaction.isInvoice ? (
                                  <FileText className="h-4 w-4 text-blue-500 mr-2" />
                                ) : (
                                  <Receipt className="h-4 w-4 text-green-500 mr-2" />
                                )}
                                {transaction.isInvoice ? 'Invoice' : 'Receipt'}
                              </div>
                            </TableCell>
                            <TableCell>{transaction.receiptNumber}</TableCell>
                            <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                            <TableCell>{transaction.customerName || 'Walk-in Customer'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                transaction.status === 'completed' ? "bg-green-500 text-white" :
                                transaction.status === 'paid' ? "bg-green-500 text-white" :
                                transaction.status === 'cancelled' ? "bg-red-500 text-white" :
                                "bg-yellow-500 text-white"
                              }>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(transaction.total)}
                              {transaction.paidAmount > 0 && (
                                <div className="text-xs text-green-600">Paid: {formatCurrency(transaction.paidAmount)}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewTransaction(transaction)}>
                                  <FileSearchIcon className="h-3.5 w-3.5" />
                                </Button>
                                {transaction.isInvoice && (
                                  <Button variant="outline" size="sm" onClick={() => handleEditStatus(transaction)}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {/* We could add a delete option here */}
                                {/* <Button variant="outline" size="sm" onClick={() => handleDeleteTransaction(transaction)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Receipt Dialog */}
      <AlertDialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <AlertDialogContent className="max-w-md">
          {selectedTransaction && (
            <POSReceiptGenerator 
              transaction={selectedTransaction} 
              onClose={() => setShowReceiptDialog(false)} 
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Invoice Dialog */}
      <AlertDialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <AlertDialogContent className="max-w-md">
          {selectedTransaction && (
            <POSInvoiceGenerator 
              transaction={selectedTransaction} 
              customerName={customerName}
              onClose={() => setShowInvoiceDialog(false)} 
              paidAmount={selectedTransaction.paidAmount}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Status Dialog */}
      <Dialog open={showEditStatusDialog} onOpenChange={setShowEditStatusDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Invoice Status</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Invoice #{selectedTransaction?.receiptNumber}</h4>
              <p className="text-sm text-muted-foreground">
                Current status: <Badge variant="outline">{selectedTransaction?.status}</Badge>
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">New Status</label>
              <Select 
                value={newStatus} 
                onValueChange={(value: 'pending' | 'completed' | 'cancelled' | 'paid') => setNewStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={confirmUpdateStatus}>
              <Check className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showConfirmDeleteDialog} onOpenChange={setShowConfirmDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {selectedTransaction?.isInvoice ? "invoice" : "receipt"} #{selectedTransaction?.receiptNumber} and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-red-500 hover:bg-red-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SalesPage;
