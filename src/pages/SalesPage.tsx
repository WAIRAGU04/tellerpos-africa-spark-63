
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
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import POSReceiptGenerator from "@/components/pos/POSReceiptGenerator";
import POSInvoiceGenerator from "@/components/pos/POSInvoiceGenerator";
import { Search, FileText, Receipt, ArrowUpDown, Calendar } from "lucide-react";

const SalesPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [customerName, setCustomerName] = useState('');

  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
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
        transaction.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredTransactions(filtered);
  }, [transactions, searchQuery, sortOrder, activeTab]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
    // Load customer name if it's an invoice
    if (transaction.isInvoice && transaction.customerId) {
      const storedCustomers = localStorage.getItem('customers');
      if (storedCustomers) {
        const customers = JSON.parse(storedCustomers);
        const customer = customers.find((c: any) => c.id === transaction.customerId);
        if (customer) {
          setCustomerName(customer.name);
        }
      }
    }
    
    if (transaction.isInvoice) {
      setShowInvoiceDialog(true);
    } else {
      setShowReceiptDialog(true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by receipt/invoice number or item..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTransactions.map(transaction => (
                  <Card key={transaction.id} className="overflow-hidden hover:shadow-md transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {transaction.isInvoice ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Receipt className="h-4 w-4 text-green-500" />
                            )}
                            {transaction.receiptNumber}
                          </CardTitle>
                          <CardDescription>
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {formatDate(transaction.timestamp)}
                          </CardDescription>
                        </div>
                        <Badge variant={transaction.isInvoice ? "outline" : "default"}>
                          {transaction.isInvoice ? 'Invoice' : 'Receipt'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
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
                      </div>
                      <Button variant="outline" onClick={() => handleViewTransaction(transaction)}>
                        View
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
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
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SalesPage;
