
import React from 'react';
import { Transaction } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, FileSearchIcon, FileText, Receipt } from 'lucide-react';
import { formatTransactionDate } from '@/utils/salesUtils';

interface SalesListViewProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
  onEditStatus: (transaction: Transaction) => void;
}

const SalesListView: React.FC<SalesListViewProps> = ({
  transactions,
  onViewTransaction,
  onEditStatus
}) => {
  return (
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
          {transactions.map(transaction => (
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
              <TableCell>{formatTransactionDate(transaction.timestamp)}</TableCell>
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
                  <Button variant="outline" size="sm" onClick={() => onViewTransaction(transaction)}>
                    <FileSearchIcon className="h-3.5 w-3.5" />
                  </Button>
                  {transaction.isInvoice && (
                    <Button variant="outline" size="sm" onClick={() => onEditStatus(transaction)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesListView;
