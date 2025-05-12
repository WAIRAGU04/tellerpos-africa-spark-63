
import { Transaction } from '@/types/pos';
import { format } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'PPP p');
};

/**
 * Get statistics about transactions
 */
export const getSalesStatistics = (transactions: Transaction[]) => {
  const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  
  const receiptCount = transactions.filter(transaction => !transaction.isInvoice).length;
  
  const invoiceCount = transactions.filter(transaction => transaction.isInvoice).length;
  
  const pendingAmount = transactions
    .filter(transaction => transaction.isInvoice && transaction.status !== 'paid')
    .reduce((sum, transaction) => sum + transaction.total, 0);

  return {
    totalSales,
    receiptCount,
    invoiceCount,
    pendingAmount
  };
};

/**
 * Export transaction data to CSV
 */
export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  const headers = [
    'ID', 'Type', 'Receipt/Invoice #', 'Date', 'Customer', 
    'Total Amount', 'Paid Amount', 'Balance', 'Status'
  ];
  
  const csvData = transactions.map(t => [
    t.id,
    t.isInvoice ? 'Invoice' : 'Receipt',
    t.receiptNumber,
    formatTransactionDate(t.timestamp),
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
};
