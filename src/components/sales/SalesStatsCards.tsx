
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface SalesStatsCardsProps {
  totalSales: number;
  receiptCount: number;
  invoiceCount: number;
  pendingAmount: number;
}

const SalesStatsCards: React.FC<SalesStatsCardsProps> = ({
  totalSales,
  receiptCount,
  invoiceCount,
  pendingAmount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{receiptCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{invoiceCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesStatsCards;
