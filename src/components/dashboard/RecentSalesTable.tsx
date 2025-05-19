
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

const RecentSalesTable = () => {
  const { salesData, isLoading } = useAnalytics();
  
  // Sort transactions by date (most recent first) and take only the top 5
  const recentSales = salesData
    .filter(sale => sale.status === 'completed')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow mb-6 animate-pulse">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="p-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // If no sales data yet, show empty state
  if (recentSales.length === 0) {
    return (
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow mb-6">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg text-green-500 font-bold">Recent Sales</h2>
          <button className="text-tellerpos text-sm">View all</button>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No sales transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Completed sales will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow mb-6">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg text-green-500 font-bold">Recent Sales</h2>
        <button className="text-tellerpos text-sm">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-tellerpos-bg/30">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-tellerpos-dark-accent divide-y divide-gray-200 dark:divide-gray-800">
            {recentSales.map(sale => {
              // Get the first item's name or show multiple items text
              const productDisplay = sale.items.length > 0 
                ? (sale.items.length > 1 
                  ? `${sale.items[0].name} + ${sale.items.length - 1} more` 
                  : sale.items[0].name)
                : "Unknown product";
                
              return (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{productDisplay}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.customerName || 'Walk-in Customer'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{format(new Date(sale.timestamp), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(sale.total)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {sale.status === 'completed' ? 'Completed' : sale.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSalesTable;
