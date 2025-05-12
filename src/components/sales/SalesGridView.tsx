
import React from 'react';
import { Transaction } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Edit, FileSearchIcon, FileText, Receipt, CalendarIcon } from 'lucide-react';
import { formatTransactionDate } from '@/utils/salesUtils';

interface SalesGridViewProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
  onEditStatus: (transaction: Transaction) => void;
}

const SalesGridView: React.FC<SalesGridViewProps> = ({
  transactions,
  onViewTransaction,
  onEditStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {transactions.map(transaction => (
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
                  {formatTransactionDate(transaction.timestamp)}
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
                <Button variant="outline" size="sm" onClick={() => onEditStatus(transaction)}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="outline" onClick={() => onViewTransaction(transaction)}>
                <FileSearchIcon className="h-3.5 w-3.5 mr-1" /> View
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SalesGridView;
