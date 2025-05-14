
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesReports from "@/components/analytics/SalesReports";
import InventoryReports from "@/components/analytics/InventoryReports";
import UserPerformance from "@/components/analytics/UserPerformance";
import FinancialReports from "@/components/analytics/FinancialReports";
import { DateRangeProvider } from "@/contexts/DateRangeContext";
import { AnalyticsProvider, useAnalytics } from "@/contexts/AnalyticsContext";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const AnalyticsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("sales");
  const { refreshAnalytics, isLoading } = useAnalytics();
  
  const handleRefresh = () => {
    refreshAnalytics();
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-green-500">Analytics & Reports</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
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
  );
};

const AnalyticsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <DateRangeProvider>
        <AnalyticsProvider>
          <AnalyticsContent />
        </AnalyticsProvider>
      </DateRangeProvider>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
