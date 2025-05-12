
import { FC } from "react";

interface StockItem {
  name: string;
  category: string;
  remaining: number | "Out of stock";
  minimum: number;
  isCritical: boolean;
}

const lowStockItems: StockItem[] = [
  {
    name: "iPhone 14 Pro",
    category: "Electronics",
    remaining: 2,
    minimum: 5,
    isCritical: false
  },
  {
    name: "Samsung Galaxy S23",
    category: "Electronics",
    remaining: 3,
    minimum: 5,
    isCritical: false
  },
  {
    name: "Nike Air Jordan",
    category: "Footwear",
    remaining: "Out of stock",
    minimum: 3,
    isCritical: true
  },
  {
    name: "Dell XPS 15",
    category: "Computers",
    remaining: 1,
    minimum: 2,
    isCritical: false
  }
];

export const LowStockAlerts: FC = () => {
  return (
    <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-bold text-green-500">Low Stock Alerts</h2>
        <button className="text-tellerpos text-sm">View all</button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.map((item, index) => (
            <div 
              key={index}
              className={`${
                item.isCritical 
                  ? "bg-red-50 dark:bg-tellerpos-bg/30 border-l-4 border-red-500" 
                  : "bg-orange-50 dark:bg-tellerpos-bg/20 border-l-4 border-orange-500"
              } rounded p-3`}
            >
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Category: {item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`${
                    item.isCritical 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-orange-600 dark:text-orange-400"
                    } font-bold`}
                  >
                    {typeof item.remaining === "number" ? `${item.remaining} left` : item.remaining}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Min: {item.minimum}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
