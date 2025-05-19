
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShift } from '@/contexts/shift';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import DashboardSummary from './DashboardSummary';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

interface DashboardContentProps {
  activeModule: string;
}

const DashboardContent = ({ activeModule }: DashboardContentProps) => {
  const { activeShift } = useShift();
  const { salesData, inventoryStats, inventoryData, refreshAnalytics } = useAnalytics();
  
  // Get recent transactions - sort by timestamp descending
  const recentTransactions = [...salesData]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  // Get low stock items from real inventory data
  const lowStockItems = inventoryData
    .filter(item => 
      item.type === 'product' && 
      'quantity' in item && 
      'lowStockThreshold' in item && 
      (item as any).quantity < (item as any).lowStockThreshold
    )
    .slice(0, 4);
  
  // Render dashboard content
  const renderDashboardContent = () => (
    <div className="space-y-6">
      {/* Dashboard Summary Cards */}
      <DashboardSummary />
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <CardDescription>Your latest sales</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.receiptNumber}</TableCell>
                        <TableCell>KES {transaction.total.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(transaction.timestamp), 'MMM d, HH:mm')}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
            <CardDescription>Items that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.map((item) => {
                  // Here we safely cast to any since we already filtered for products
                  const productItem = item as any;
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-tellerpos-dark-accent/10 rounded-md">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {productItem.sku || '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${productItem.quantity === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                          {productItem.quantity} {productItem.unitOfMeasurement || 'units'}
                        </p>
                        <p className="text-xs text-muted-foreground">Min: {productItem.lowStockThreshold}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No low stock items</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Total inventory value: KSh {inventoryStats.inventoryValue.toLocaleString()}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
  
  // Placeholder content for other modules
  const renderPlaceholderContent = (moduleName: string) => (
    <div className="bg-tellerpos-dark-accent/20 border border-tellerpos-dark-accent/30 rounded-lg p-8 text-center">
      <h2 className="text-2xl font-bold text-tellerpos mb-4">{moduleName} Module</h2>
      <p className="text-tellerpos-gray-light">
        This module will be implemented in future updates. Stay tuned!
      </p>
    </div>
  );
  
  return (
    <main className="flex-1 overflow-auto p-6">
      {activeModule === "dashboard" ? (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              {renderDashboardContent()}
            </TabsContent>
            <TabsContent value="analytics" className="mt-6">
              {renderPlaceholderContent("Analytics")}
            </TabsContent>
            <TabsContent value="reports" className="mt-6">
              {renderPlaceholderContent("Reports")}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center">
          {renderPlaceholderContent(activeModule.charAt(0).toUpperCase() + activeModule.slice(1))}
        </div>
      )}
    </main>
  );
};

export default DashboardContent;
