
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
  Briefcase,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Sun,
  Moon,
  User,
  Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Dashboard routes
const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Sell",
    icon: ShoppingBag,
    path: "/dashboard/sell",
  },
  {
    title: "Shift",
    icon: Calendar,
    path: "/dashboard/shift",
  },
  {
    title: "Sales",
    icon: BarChart3,
    path: "/dashboard/sales",
  },
  {
    title: "Stock",
    icon: Package2,
    path: "/dashboard/stock",
  },
  {
    title: "Accounts",
    icon: Wallet,
    path: "/dashboard/accounts",
  },
  {
    title: "Analytics",
    icon: LineChart,
    path: "/dashboard/analytics",
  },
  {
    title: "Users",
    icon: Users,
    path: "/dashboard/users",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
  {
    title: "Backoffice",
    icon: Briefcase,
    path: "/dashboard/backoffice",
  }
];

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState("/dashboard");
  const [greeting, setGreeting] = useState("");
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    setActivePath(path);
    navigate(path);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };
  
  // Get greeting based on time of day
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return "Good morning";
      if (hour >= 12 && hour < 18) return "Good afternoon";
      return "Good evening";
    };
    
    setGreeting(getGreeting());
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-tellerpos-bg text-gray-800 dark:text-gray-100">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white dark:bg-tellerpos-dark-accent border-r border-gray-200 dark:border-gray-800 hidden md:block",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className={cn(
              "flex items-center transition-all",
              collapsed ? "justify-center w-full" : "justify-start"
            )}>
              {!collapsed && (
                <span className="text-xl font-bold">
                  <span className="text-tellerpos">Teller</span>
                  <span>POS</span>
                </span>
              )}
              {collapsed && (
                <span className="text-xl font-bold text-tellerpos">T</span>
              )}
            </div>
            
            <button 
              onClick={toggleSidebar}
              className={cn(
                "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-tellerpos-bg transition-colors",
                collapsed && "absolute right-0 transform translate-x-1/2 bg-white dark:bg-tellerpos-dark-accent border border-gray-200 dark:border-gray-800 rounded-full"
              )}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className={cn(
            "px-4 py-5 border-b border-gray-200 dark:border-gray-800",
            collapsed ? "flex justify-center" : ""
          )}>
            {collapsed ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-tellerpos text-white flex items-center justify-center">
                  <User size={20} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{greeting},</p>
                <p className="font-semibold text-sm">CHRISTOPHER NJERU</p>
                <p className="text-xs text-tellerpos">AMAZING SHOP</p>
              </div>
            )}
          </div>
          
          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center w-full px-2 py-3 rounded-md transition-colors",
                  activePath === item.path 
                    ? "bg-tellerpos text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50",
                  collapsed ? "justify-center" : "justify-start"
                )}
              >
                <item.icon size={20} className={collapsed ? "" : "mr-3"} />
                {!collapsed && <span>{item.title}</span>}
              </button>
            ))}
          </nav>
          
          {/* Logout Button */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate("/")}
              className={cn(
                "flex items-center w-full px-2 py-3 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <LogOut size={20} className={collapsed ? "" : "mr-3"} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden",
        mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-tellerpos-dark-accent transition-transform",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-bold">
              <span className="text-tellerpos">Teller</span>
              <span>POS</span>
            </span>
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          {/* User Profile Section */}
          <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{greeting},</p>
              <p className="font-semibold text-sm">CHRISTOPHER NJERU</p>
              <p className="text-xs text-tellerpos">AMAZING SHOP</p>
            </div>
          </div>
          
          {/* Mobile Navigation Items */}
          <nav className="px-2 py-4 space-y-1 overflow-y-auto h-[calc(100%-172px)]">
            {sidebarItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "flex items-center w-full px-2 py-3 rounded-md transition-colors",
                  activePath === item.path 
                    ? "bg-tellerpos text-white" 
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50"
                )}
              >
                <item.icon size={20} className="mr-3" />
                <span>{item.title}</span>
              </button>
            ))}
          </nav>
          
          {/* Mobile Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => navigate("/")}
              className="flex items-center w-full px-2 py-3 rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        collapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Top Header Bar */}
        <header className="h-16 flex items-center justify-between px-4 bg-white dark:bg-tellerpos-dark-accent border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 md:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1 md:ml-4">
            <h1 className="text-xl font-semibold">{sidebarItems.find(item => item.path === activePath)?.title || "Dashboard"}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50">
              <Bell size={20} />
            </button>
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-tellerpos-bg/50">
              <Moon size={20} />
            </button>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <div className="p-4 md:p-6">
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
