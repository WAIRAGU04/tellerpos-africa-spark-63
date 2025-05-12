
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReports from "@/components/analytics/SalesReports";
import InventoryReports from "@/components/analytics/InventoryReports";
import UserPerformance from "@/components/analytics/UserPerformance";
import FinancialReports from "@/components/analytics/FinancialReports";
import { DateRangeProvider } from "@/contexts/DateRangeContext";

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("sales");
  
  return (
    <DashboardLayout>
      <DateRangeProvider>
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-green-500">Analytics & Reports</h1>
          </div>
          
          <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full flex flex-wrap md:flex-nowrap">
              <TabsTrigger value="sales" className="flex-1">Sales Reports</TabsTrigger>
              <TabsTrigger value="inventory" className="flex-1">Inventory Reports</TabsTrigger>
              <TabsTrigger value="financial" className="flex-1">Financial Reports</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">User Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <SalesReports />
            </TabsContent>
            
            <TabsContent value="inventory">
              <InventoryReports />
            </TabsContent>
            
            <TabsContent value="financial">
              <FinancialReports />
            </TabsContent>
            
            <TabsContent value="users">
              <UserPerformance />
            </TabsContent>
          </Tabs>
        </div>
      </DateRangeProvider>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
