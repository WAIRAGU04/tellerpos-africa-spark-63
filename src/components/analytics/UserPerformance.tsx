
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateRangePicker from "./DateRangePicker";
import { useDateRange } from "@/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/utils";
import ReportExport from "./ReportExport";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Transaction } from "@/types/pos";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

// Mock user data - in a real app, this would come from your user management system
const MOCK_USERS = [
  { id: "user1", name: "John Doe", role: "Cashier", image: null },
  { id: "user2", name: "Jane Smith", role: "Cashier", image: null },
  { id: "user3", name: "Robert Johnson", role: "Manager", image: null },
  { id: "user4", name: "Mary Williams", role: "Cashier", image: null },
  { id: "current-user-id", name: "You", role: "Admin", image: null }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

interface UserSalesData {
  userId: string;
  name: string;
  role: string;
  sales: number;
  transactions: number;
  averageSale: number;
  dailySales: { [key: string]: number };
}

const UserPerformance: React.FC = () => {
  const { dateRange } = useDateRange();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userSalesData, setUserSalesData] = useState<UserSalesData[]>([]);
  const [activeReport, setActiveReport] = useState<"overview" | "comparison" | "daily">("overview");
  
  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);
  
  // Process sales data by user
  useEffect(() => {
    if (!transactions.length) return;

    const startTimestamp = dateRange.startDate.getTime();
    const endTimestamp = dateRange.endDate.getTime();
    
    // Filter transactions in date range
    const filteredTransactions = transactions.filter(transaction => {
      const txTime = new Date(transaction.timestamp).getTime();
      return txTime >= startTimestamp && 
             txTime <= endTimestamp &&
             transaction.status === "completed";
    });
    
    const userSales = new Map();
    
    // Initialize with all users having zero sales
    MOCK_USERS.forEach(user => {
      userSales.set(user.id, {
        userId: user.id,
        name: user.name,
        role: user.role,
        sales: 0,
        transactions: 0,
        averageSale: 0,
        dailySales: {},
      });
    });
    
    // Aggregate sales by user
    filteredTransactions.forEach(transaction => {
      // For demo purposes, assign random users to transactions
      // In a real app, each transaction would already have a userId field
      const userId = transaction.userId || assignRandomUser();
      
      if (!userSales.has(userId)) {
        const mockUser = MOCK_USERS.find(u => u.id === userId) || {
          id: userId,
          name: "Unknown User",
          role: "Unknown",
          image: null,
        };
        
        userSales.set(userId, {
          userId,
          name: mockUser.name,
          role: mockUser.role,
          sales: 0,
          transactions: 0,
          averageSale: 0,
          dailySales: {},
        });
      }
      
      const userData = userSales.get(userId);
      userData.sales += transaction.total;
      userData.transactions += 1;
      
      // Track sales by day
      const day = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
      userData.dailySales[day] = (userData.dailySales[day] || 0) + transaction.total;
      
      userSales.set(userId, userData);
    });
    
    // Calculate average sale per transaction
    userSales.forEach(userData => {
      if (userData.transactions > 0) {
        userData.averageSale = userData.sales / userData.transactions;
      }
    });
    
    setUserSalesData(Array.from(userSales.values()));
    
  }, [transactions, dateRange]);

  // For demo purposes, assign random users to transactions
  const assignRandomUser = () => {
    const userIds = MOCK_USERS.map(user => user.id);
    const randomIndex = Math.floor(Math.random() * userIds.length);
    return userIds[randomIndex];
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Generate chart data for daily sales comparison
  const getDailySalesChartData = () => {
    const allDays = new Set<string>();
    userSalesData.forEach(user => {
      Object.keys(user.dailySales).forEach(day => allDays.add(day));
    });
    
    // Sort days chronologically
    const sortedDays = Array.from(allDays).sort();
    
    return sortedDays.map(day => {
      const dataPoint: any = {
        day: format(new Date(day), 'MMM dd'),
      };
      
      userSalesData.forEach(user => {
        dataPoint[user.name] = user.dailySales[day] || 0;
      });
      
      return dataPoint;
    });
  };
  
  // Total sales for the period
  const totalSales = userSalesData.reduce((sum, user) => sum + user.sales, 0);
  
  // Total number of transactions
  const totalTransactions = userSalesData.reduce((sum, user) => sum + user.transactions, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DateRangePicker />
        
        <div className="flex gap-2">
          <select 
            className="border rounded px-2 py-1 text-sm" 
            value={activeReport} 
            onChange={(e) => setActiveReport(e.target.value as any)}
          >
            <option value="overview">User Overview</option>
            <option value="comparison">User Comparison</option>
            <option value="daily">Daily Breakdown</option>
          </select>
          
          <ReportExport 
            data={userSalesData} 
            filename="user-performance-report" 
          />
        </div>
      </div>
      
      {/* User Overview Report */}
      {activeReport === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-3xl text-green-500">{formatCurrency(totalSales)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {totalTransactions} transactions in period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Users</CardDescription>
                <CardTitle className="text-3xl text-green-500">{userSalesData.filter(user => user.transactions > 0).length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Active users during period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average per User</CardDescription>
                <CardTitle className="text-3xl text-green-500">
                  {formatCurrency(totalSales / (userSalesData.filter(user => user.transactions > 0).length || 1))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Average sales per active user
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>User Performance</CardTitle>
              <CardDescription>Sales performance by user during selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>User sales performance for selected period</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Average Sale</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSalesData.length > 0 ? (
                    userSalesData
                      .filter(user => user.transactions > 0)
                      .sort((a, b) => b.sales - a.sales)
                      .map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 bg-primary">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.transactions}</TableCell>
                          <TableCell>{formatCurrency(user.averageSale)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(user.sales)}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No user performance data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* User Comparison Report */}
      {activeReport === "comparison" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales by User</CardTitle>
              <CardDescription>Breakdown of total sales by user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {userSalesData.filter(user => user.sales > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userSalesData.filter(user => user.sales > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="sales"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userSalesData.filter(user => user.sales > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatCurrency(value), "Sales"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No sales data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transactions by User</CardTitle>
              <CardDescription>Number of transactions processed by each user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {userSalesData.filter(user => user.transactions > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userSalesData
                        .filter(user => user.transactions > 0)
                        .sort((a, b) => b.transactions - a.transactions)}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="transactions" fill="#8884d8" name="Transactions" />
                      <Bar dataKey="averageSale" fill="#10b981" name="Avg. Sale Value" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No transaction data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Daily Sales Report */}
      {activeReport === "daily" && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales by User</CardTitle>
            <CardDescription>Track daily sales performance per user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px]">
              {getDailySalesChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getDailySalesChartData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [formatCurrency(value), ""]} />
                    <Legend />
                    {userSalesData
                      .filter(user => user.transactions > 0)
                      .map((user, index) => (
                        <Line
                          key={user.userId}
                          type="monotone"
                          dataKey={user.name}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No daily sales data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserPerformance;
