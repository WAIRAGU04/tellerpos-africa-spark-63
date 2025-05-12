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
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [totalSales, setTotalSales] = useState(0);
  const isMobile = useIsMobile();

  // Calculate total sales on component mount
  useEffect(() => {
    const transactions = getTransactions();
    const sales = transactions.filter(tx => tx.type === 'sale').reduce((sum, tx) => sum + tx.amount, 0);
    setTotalSales(sales);
  }, []);
  const handleTabChange = value => {
    setActiveTab(value);
  };
  return <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-green-500 font-extrabold md:text-4xl">Accounts</h1>
            <p className="text-lime-200 text-lg font-semibold">
              Total Sales: {formatCurrency(totalSales)}
            </p>
          </div>
        </div>

        {isMobile ? <div className="mb-6">
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Tab" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="transfers">Transfers</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="sales-orders">Sales Orders</SelectItem>
                <SelectItem value="quotations">Quotations</SelectItem>
              </SelectContent>
            </Select>
          </div> : <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid md:grid-cols-5 mb-6 md:mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transfers">Transfers</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="sales-orders">Sales Orders</TabsTrigger>
              <TabsTrigger value="quotations">Quotations</TabsTrigger>
            </TabsList>
          </Tabs>}
        
        <div className="space-y-4">
          {activeTab === "overview" && <AccountsOverview />}
          {activeTab === "transfers" && <AccountsTransfers />}
          {activeTab === "reports" && <AccountsReports />}
          {activeTab === "sales-orders" && <SalesOrdersTab />}
          {activeTab === "quotations" && <QuotationsTab />}
        </div>
      </div>
    </DashboardLayout>;
};
export default AccountsPage;