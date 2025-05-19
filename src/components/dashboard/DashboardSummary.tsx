
import React, { useEffect } from 'react';
import { useShift } from '@/contexts/shift';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { BarChart3, ShoppingBag, Package2, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  description?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, description }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-tellerpos/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-500">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend.value > 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={trend.value > 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

const DashboardSummary: React.FC = () => {
  const { activeShift } = useShift();
  const { salesData, inventoryStats, isLoading, refreshAnalytics } = useAnalytics();
  
  // Refresh analytics data when component mounts
  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Calculate today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = salesData
    .filter(transaction => new Date(transaction.timestamp) >= today)
    .reduce((sum, transaction) => sum + transaction.total, 0);
  
  // Calculate yesterday's sales for trend calculation
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayEnd = new Date(today);
  yesterdayEnd.setMilliseconds(-1);
  
  const yesterdaySales = salesData
    .filter(transaction => {
      const date = new Date(transaction.timestamp);
      return date >= yesterday && date < today;
    })
    .reduce((sum, transaction) => sum + transaction.total, 0);
  
  // Calculate trend percentage
  const salesTrend = yesterdaySales > 0 
    ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) 
    : 0;
  
  // Get shift info
  const shiftInfo = activeShift
    ? `Started ${formatDistanceToNow(new Date(activeShift.clockInTime), { addSuffix: true })}`
    : "No active shift";

  // Calculate products sold today
  const productsSoldToday = salesData
    .filter(transaction => new Date(transaction.timestamp) >= today)
    .reduce((sum, transaction) => sum + transaction.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  
  // Calculate products sold yesterday
  const productsSoldYesterday = salesData
    .filter(transaction => {
      const date = new Date(transaction.timestamp);
      return date >= yesterday && date < today;
    })
    .reduce((sum, transaction) => sum + transaction.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  
  // Calculate product trend
  const productTrend = productsSoldYesterday > 0 
    ? Math.round(((productsSoldToday - productsSoldYesterday) / productsSoldYesterday) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DashboardCard
        title="Today's Sales"
        value={formatCurrency(todaySales)}
        icon={<BarChart3 className="h-4 w-4 text-tellerpos" />}
        trend={{ value: salesTrend, label: "from yesterday" }}
      />
      
      <DashboardCard
        title="Products Sold"
        value={productsSoldToday}
        icon={<ShoppingBag className="h-4 w-4 text-tellerpos" />}
        trend={{ value: productTrend, label: "from yesterday" }}
      />
      
      <DashboardCard
        title="Inventory Status"
        value={`${inventoryStats.lowStockCount} Low Stock`}
        icon={<Package2 className="h-4 w-4 text-tellerpos" />}
        description={`${inventoryStats.outOfStockCount} items out of stock`}
      />
      
      <DashboardCard
        title="Current Shift"
        value={activeShift ? formatCurrency(activeShift.totalSales) : "No Shift"}
        icon={<Calendar className="h-4 w-4 text-tellerpos" />}
        description={shiftInfo}
      />
    </div>
  );
};

export default DashboardSummary;
