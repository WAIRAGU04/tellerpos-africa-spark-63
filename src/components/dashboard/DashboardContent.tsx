
import { cn } from "@/lib/utils";
import DashboardSummary from "./DashboardSummary";
import RecentSalesTable from "./RecentSalesTable";
import LowStockAlerts from "./LowStockAlerts";

interface DashboardContentProps {
  collapsed: boolean;
}

const DashboardContent = ({ collapsed }: DashboardContentProps) => {
  return (
    <div className={cn("p-4 md:p-6")}>
      <DashboardSummary />
      <RecentSalesTable />
      <LowStockAlerts />
    </div>
  );
};

export default DashboardContent;
