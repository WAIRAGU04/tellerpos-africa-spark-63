
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountsOverview from '@/components/accounts/AccountsOverview';
import AccountsTransfers from '@/components/accounts/AccountsTransfers';
import AccountsReports from '@/components/accounts/AccountsReports';
import SalesOrdersTab from '@/components/accounts/SalesOrdersTab';
import QuotationsTab from '@/components/accounts/QuotationsTab';
import { getTransactions } from '@/services/accountsService';
import { formatCurrency } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [totalSales, setTotalSales] = useState(0);
  const isMobile = useIsMobile();

  // Calculate total sales on component mount
  useEffect(() => {
    const transactions = getTransactions();
    const sales = transactions
      .filter(tx => tx.type === 'sale')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    setTotalSales(sales);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Accounts</h1>
            <p className="text-muted-foreground">
              Total Sales: {formatCurrency(totalSales)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid ${isMobile ? 'grid-cols-2 gap-2 overflow-x-auto' : 'md:grid-cols-5'} mb-6 md:mb-8`}>
            <TabsTrigger value="overview" className={isMobile ? "text-sm py-1" : ""}>Overview</TabsTrigger>
            <TabsTrigger value="transfers" className={isMobile ? "text-sm py-1" : ""}>Transfers</TabsTrigger>
            <TabsTrigger value="reports" className={isMobile ? "text-sm py-1" : ""}>Reports</TabsTrigger>
            <TabsTrigger value="sales-orders" className={isMobile ? "text-sm py-1" : ""}>Sales Orders</TabsTrigger>
            <TabsTrigger value="quotations" className={isMobile ? "text-sm py-1" : ""}>Quotations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <AccountsOverview />
          </TabsContent>
          
          <TabsContent value="transfers" className="space-y-4">
            <AccountsTransfers />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-4">
            <AccountsReports />
          </TabsContent>
          
          <TabsContent value="sales-orders" className="space-y-4">
            <SalesOrdersTab />
          </TabsContent>
          
          <TabsContent value="quotations" className="space-y-4">
            <QuotationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AccountsPage;
