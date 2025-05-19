
const RecentSalesTable = () => {
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
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">iPhone 14 Pro</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">Jane Smith</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">May 8, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">KSh 145,000</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Samsung TV</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">John Doe</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">May 8, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">KSh 85,000</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Nike Air Max</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">Mary Johnson</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">May 7, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">KSh 12,500</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">MacBook Pro</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">Robert Williams</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">May 7, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">KSh 210,000</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">Coffee Maker</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">Sarah Brown</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">May 6, 2025</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">KSh 7,500</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Returned
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSalesTable;
