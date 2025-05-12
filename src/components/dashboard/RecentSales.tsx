
import { FC } from "react";

interface SaleItem {
  product: string;
  customer: string;
  date: string;
  amount: string;
  status: "Completed" | "Pending" | "Returned";
}

const recentSalesData: SaleItem[] = [
  {
    product: "iPhone 14 Pro",
    customer: "Jane Smith",
    date: "May 8, 2025",
    amount: "KSh 145,000",
    status: "Completed"
  },
  {
    product: "Samsung TV",
    customer: "John Doe",
    date: "May 8, 2025",
    amount: "KSh 85,000",
    status: "Completed"
  },
  {
    product: "Nike Air Max",
    customer: "Mary Johnson",
    date: "May 7, 2025",
    amount: "KSh 12,500",
    status: "Pending"
  },
  {
    product: "MacBook Pro",
    customer: "Robert Williams",
    date: "May 7, 2025",
    amount: "KSh 210,000",
    status: "Completed"
  },
  {
    product: "Coffee Maker",
    customer: "Sarah Brown",
    date: "May 6, 2025",
    amount: "KSh 7,500",
    status: "Returned"
  }
];

export const RecentSales: FC = () => {
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
            {recentSalesData.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.product}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.customer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === "Completed" ? "bg-green-100 text-green-800" : 
                    item.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-red-100 text-red-800"
                  }`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
