
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { InventoryItem, Product } from '@/types/inventory';

const LowStockAlerts = () => {
  const { inventoryData, isLoading } = useAnalytics();
  
  // Filter to get only products (not services) with low stock
  const lowStockItems = inventoryData
    .filter((item: InventoryItem): item is Product => 
      item.type === 'product' && 
      item.stock !== undefined && 
      item.reorderLevel !== undefined && 
      item.stock < item.reorderLevel
    )
    .sort((a, b) => {
      // Sort out of stock first, then by how critically low they are
      if (a.stock === 0 && b.stock !== 0) return -1;
      if (a.stock !== 0 && b.stock === 0) return 1;
      
      // Both items have reorderLevel because of our filter above
      const aRatio = a.stock / a.reorderLevel;
      const bRatio = b.stock / b.reorderLevel;
      return aRatio - bRatio;
    })
    .slice(0, 4); // Take only top 4 lowest stock items

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow animate-pulse">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border-l-4 border-gray-200 rounded p-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="mt-2 flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // If no low stock items, show empty state
  if (lowStockItems.length === 0) {
    return (
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold text-green-500">Low Stock Alerts</h2>
          <button className="text-tellerpos text-sm">View all</button>
        </div>
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No low stock items</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            All inventory items are above their reorder levels
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-green-500">Low Stock Alerts</h2>
        <button className="text-tellerpos text-sm">View all</button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.map((item) => {
            const isOutOfStock = item.stock === 0;
            const alertClass = isOutOfStock 
              ? "bg-red-50 dark:bg-tellerpos-bg/30 border-l-4 border-red-500" 
              : "bg-orange-50 dark:bg-tellerpos-bg/20 border-l-4 border-orange-500";
            
            return (
              <div key={item.id} className={`${alertClass} rounded p-3`}>
                <div className="flex justify-between">
                  <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Category: {item.category || 'Uncategorized'}</p>
                  </div>
                  <div className="text-right">
                    {isOutOfStock ? (
                      <p className="text-red-600 dark:text-red-400 font-bold">Out of stock</p>
                    ) : (
                      <p className="text-orange-600 dark:text-orange-400 font-bold">{item.stock} left</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Min: {item.reorderLevel}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LowStockAlerts;
