
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Transaction } from '@/types/pos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";

// Importing refactored components
import SalesStatsCards from '@/components/sales/SalesStatsCards';
import SalesFilters from '@/components/sales/SalesFilters';
import SalesGridView from '@/components/sales/SalesGridView';
import SalesListView from '@/components/sales/SalesListView';
import EditStatusDialog from '@/components/sales/EditStatusDialog';
import DeleteConfirmDialog from '@/components/sales/DeleteConfirmDialog';
import POSReceiptGenerator from "@/components/pos/POSReceiptGenerator";
import POSInvoiceGenerator from "@/components/pos/POSInvoiceGenerator";

// Importing utility functions
import { getSalesStatistics, exportTransactionsToCSV } from '@/utils/salesUtils';

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
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
  
  // States for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined });
  const [customerFilter, setCustomerFilter] = useState('');
  const [amountFilter, setAmountFilter] = useState<{ min: string, max: string }>({ min: '', max: '' });

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

  // Handle viewing transaction details
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
    setShowEditStatusDialog(true);
  };
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowConfirmDeleteDialog(true);
  };
  
  const confirmUpdateStatus = (newStatus: "completed" | "pending" | "cancelled" | "paid" | "refunded") => {
    if (!selectedTransaction) return;
    
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

  // Calculate stats from transactions
  const stats = getSalesStatistics(transactions);

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4">
        {/* Stats Cards Section */}
        <SalesStatsCards
          totalSales={stats.totalSales}
          receiptCount={stats.receiptCount}
          invoiceCount={stats.invoiceCount}
          pendingAmount={stats.pendingAmount}
        />
        
        {/* Filters Section */}
        <SalesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          viewMode={viewMode}
          setViewMode={setViewMode}
          dateRange={dateRange}
          setDateRange={setDateRange}
          customerFilter={customerFilter}
          setCustomerFilter={setCustomerFilter}
          amountFilter={amountFilter}
          setAmountFilter={setAmountFilter}
          onExport={() => exportTransactionsToCSV(filteredTransactions)}
        />
        
        {/* Tabs and Content */}
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
                  <SalesGridView
                    transactions={filteredTransactions}
                    onViewTransaction={handleViewTransaction}
                    onEditStatus={handleEditStatus}
                  />
                ) : (
                  <SalesListView
                    transactions={filteredTransactions}
                    onViewTransaction={handleViewTransaction}
                    onEditStatus={handleEditStatus}
                  />
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
              receiptNumber={selectedTransaction.receiptNumber} 
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
              invoiceNumber={selectedTransaction.receiptNumber}
              customerName={customerName}
              onClose={() => setShowInvoiceDialog(false)} 
              paidAmount={selectedTransaction.paidAmount}
            />
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Status Dialog */}
      <EditStatusDialog
        open={showEditStatusDialog}
        onOpenChange={setShowEditStatusDialog}
        transaction={selectedTransaction}
        onUpdateStatus={confirmUpdateStatus}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showConfirmDeleteDialog}
        onOpenChange={setShowConfirmDeleteDialog}
        transaction={selectedTransaction}
        onConfirmDelete={confirmDeleteTransaction}
      />
    </DashboardLayout>
  );
};

export default SalesPage;
