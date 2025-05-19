
import { cn } from "@/lib/utils";
import DashboardCards from "./DashboardCards";
import RecentSalesTable from "./RecentSalesTable";
import LowStockAlerts from "./LowStockAlerts";

interface DashboardContentProps {
  collapsed: boolean;
}

const DashboardContent = ({ collapsed }: DashboardContentProps) => {
  return (
    <div className={cn("p-4 md:p-6")}>
      <DashboardCards />
      <RecentSalesTable />
      <LowStockAlerts />
    </div>
  );
};

export default DashboardContent;
