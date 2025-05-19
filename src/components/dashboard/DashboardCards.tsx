
export const DashboardCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Today's Sales Card */}
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2 text-xl">Today's Sales</h3>
        <p className="text-2xl font-bold text-green-500">KSh 24,500</p>
        <div className="flex items-center mt-2">
          <span className="text-green-500 text-sm font-medium">+12%</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
        </div>
      </div>
      
      {/* Products Sold Card */}
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2 text-xl">Products Sold</h3>
        <p className="text-2xl font-bold text-green-500">51</p>
        <div className="flex items-center mt-2">
          <span className="text-green-500 text-sm font-medium">+8%</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
        </div>
      </div>
      
      {/* Active Customers Card */}
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2 text-xl">Active Customers</h3>
        <p className="text-2xl font-bold text-green-500">24</p>
        <div className="flex items-center mt-2">
          <span className="text-red-500 text-sm font-medium">-2%</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
        </div>
      </div>
      
      {/* Inventory Value Card */}
      <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
        <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2 text-xl">Inventory Value</h3>
        <p className="text-2xl font-bold text-green-500">KSh 459,200</p>
        <div className="flex items-center mt-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm">32 products low in stock</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
