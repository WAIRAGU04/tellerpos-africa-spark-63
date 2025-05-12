
import { FC } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  note?: string;
}

export const StatCard: FC<StatCardProps> = ({ title, value, change, note }) => {
  return (
    <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
      <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-2 text-xl">{title}</h3>
      <p className="text-2xl font-bold text-green-500">{value}</p>
      <div className="flex items-center mt-2">
        {change ? (
          <>
            <span className={`text-sm font-medium ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {change.value}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
          </>
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-sm">{note}</span>
        )}
      </div>
    </div>
  );
};

export const DashboardCards: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="Today's Sales" 
        value="KSh 24,500" 
        change={{ value: "+12%", isPositive: true }}
      />
      <StatCard 
        title="Products Sold" 
        value="51" 
        change={{ value: "+8%", isPositive: true }}
      />
      <StatCard 
        title="Active Customers" 
        value="24" 
        change={{ value: "-2%", isPositive: false }}
      />
      <StatCard 
        title="Inventory Value" 
        value="KSh 459,200" 
        note="32 products low in stock"
      />
    </div>
  );
};
