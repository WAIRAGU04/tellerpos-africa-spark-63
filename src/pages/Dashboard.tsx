
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Calendar, 
  BarChart3, 
  Package2, 
  Wallet, 
  LineChart, 
  Users, 
  Settings, 
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { UserData } from "@/types/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

// Dashboard routes
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "sell",
    label: "Sell",
    icon: ShoppingBag,
    path: "/dashboard/sell",
  },
  {
    id: "shift",
    label: "Shift",
    icon: Calendar,
    path: "/dashboard/shift",
  },
  {
    id: "sales",
    label: "Sales",
    icon: BarChart3,
    path: "/dashboard/sales",
  },
  {
    id: "stock",
    label: "Stock",
    icon: Package2,
    path: "/dashboard/stock",
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: Wallet,
    path: "/dashboard/accounts",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: LineChart,
    path: "/dashboard/analytics",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    path: "/dashboard/users",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
  {
    id: "backoffice",
    label: "Backoffice",
    icon: Briefcase,
    path: "/dashboard/backoffice",
  }
];

const Dashboard = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const navigate = useNavigate();

  // In a real application, this would come from an authentication system
  // For now, we'll use mock data
  const userData: UserData = {
    firstName: "Christopher",
    lastName: "Njeru",
    businessName: "AMAZING SHOP"
  };

  // When the component mounts, set the active module based on the current path
  useEffect(() => {
    const currentPath = window.location.pathname;
    const matchingItem = menuItems.find(item => item.path === currentPath);
    if (matchingItem) {
      setActiveModule(matchingItem.id);
    }
  }, []);

  const handleModuleChange = (moduleId: string) => {
    setActiveModule(moduleId);
    const selectedModule = menuItems.find(item => item.id === moduleId);
    if (selectedModule) {
      navigate(selectedModule.path);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
      {/* Sidebar component */}
      <DashboardSidebar 
        userData={userData} 
        activeModule={activeModule} 
        setActiveModule={handleModuleChange}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header component */}
        <DashboardHeader userData={userData} />
        
        {/* Dashboard Content */}
        <div className="p-4 md:p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Dashboard Cards */}
            <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Today's Sales</h3>
              <p className="text-2xl font-bold">KSh 24,500</p>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-sm font-medium">+12%</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Products Sold</h3>
              <p className="text-2xl font-bold">51</p>
              <div className="flex items-center mt-2">
                <span className="text-green-500 text-sm font-medium">+8%</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Active Customers</h3>
              <p className="text-2xl font-bold">24</p>
              <div className="flex items-center mt-2">
                <span className="text-red-500 text-sm font-medium">-2%</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">from yesterday</span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow p-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">Inventory Value</h3>
              <p className="text-2xl font-bold">KSh 459,200</p>
              <div className="flex items-center mt-2">
                <span className="text-gray-500 dark:text-gray-400 text-sm">32 products low in stock</span>
              </div>
            </div>
          </div>
          
          {/* Recent Sales Section */}
          <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow mb-6">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Recent Sales</h2>
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
          
          {/* Low Stock Alert Section */}
          <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
