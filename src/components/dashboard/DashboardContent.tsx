
import { DashboardCards } from "./DashboardCards";
import { RecentSales } from "./RecentSales";
import { LowStockAlerts } from "./LowStockAlerts";

interface DashboardContentProps {
  collapsed?: boolean;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ collapsed }) => {
  return (
    <div className="p-4 md:p-6">
      <DashboardCards />
      <RecentSales />
      <LowStockAlerts />
    </div>
  );
};
