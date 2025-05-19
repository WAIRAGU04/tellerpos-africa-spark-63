
const LowStockAlerts = () => {
  return (
    <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-green-500">Low Stock Alerts</h2>
        <button className="text-tellerpos text-sm">View all</button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-tellerpos-bg/20 border-l-4 border-orange-500 rounded p-3">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">iPhone 14 Pro</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category: Electronics</p>
              </div>
              <div className="text-right">
                <p className="text-orange-600 dark:text-orange-400 font-bold">2 left</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min: 5</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-tellerpos-bg/20 border-l-4 border-orange-500 rounded p-3">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">Samsung Galaxy S23</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category: Electronics</p>
              </div>
              <div className="text-right">
                <p className="text-orange-600 dark:text-orange-400 font-bold">3 left</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min: 5</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-tellerpos-bg/30 border-l-4 border-red-500 rounded p-3">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">Nike Air Jordan</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category: Footwear</p>
              </div>
              <div className="text-right">
                <p className="text-red-600 dark:text-red-400 font-bold">Out of stock</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min: 3</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-tellerpos-bg/20 border-l-4 border-orange-500 rounded p-3">
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold">Dell XPS 15</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category: Computers</p>
              </div>
              <div className="text-right">
                <p className="text-orange-600 dark:text-orange-400 font-bold">1 left</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min: 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlerts;
