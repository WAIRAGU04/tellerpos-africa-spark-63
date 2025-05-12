
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/pos";
import DateRangePicker from "./DateRangePicker";
import { useDateRange } from "@/contexts/DateRangeContext";
import { format } from "date-fns";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import ReportExport from "./ReportExport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

const SalesReports: React.FC = () => {
  const { dateRange } = useDateRange();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [activeReport, setActiveReport] = useState<"overview" | "details" | "byProduct" | "byPaymentMethod">("overview");
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  // Load transactions from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
  }, []);
  
  // Filter transactions based on date range
  useEffect(() => {
    if (!transactions.length) return;
    
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate >= dateRange.startDate && 
             transactionDate <= dateRange.endDate &&
             transaction.status === "completed";
    });
    
    setFilteredTransactions(filtered);
    
    // Process daily sales data
    const salesByDay = new Map();
    filtered.forEach(transaction => {
      const day = format(new Date(transaction.timestamp), 'yyyy-MM-dd');
      const existingSale = salesByDay.get(day) || { day, amount: 0, count: 0 };
      existingSale.amount += transaction.total;
      existingSale.count += 1;
      salesByDay.set(day, existingSale);
    });
    
    // Convert to array and sort by date
    const dailySalesArray = Array.from(salesByDay.values());
    dailySalesArray.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    setDailySales(dailySalesArray.map(item => ({
      ...item,
      day: format(new Date(item.day), 'MMM dd'),
      formattedAmount: formatCurrency(item.amount)
    })));
    
    // Process payment method breakdown
    const paymentMethods = new Map();
    filtered.forEach(transaction => {
      transaction.payments.forEach(payment => {
        const existingPayment = paymentMethods.get(payment.method) || { method: payment.method, amount: 0, count: 0 };
        existingPayment.amount += payment.amount;
        existingPayment.count += 1;
        paymentMethods.set(payment.method, existingPayment);
      });
    });
    
    setPaymentMethodBreakdown(Array.from(paymentMethods.values()).map(item => ({
      ...item,
      method: formatPaymentMethod(item.method),
      formattedAmount: formatCurrency(item.amount)
    })));
    
    // Process top products data
    const products = new Map();
    filtered.forEach(transaction => {
      transaction.items.forEach(item => {
        const existingProduct = products.get(item.id) || { 
          id: item.id, 
          name: item.name, 
          quantity: 0, 
          amount: 0 
        };
        existingProduct.quantity += item.quantity;
        existingProduct.amount += (item.price * item.quantity);
        products.set(item.id, existingProduct);
      });
    });
    
    // Sort products by amount and get top 10
    const productsArray = Array.from(products.values());
    productsArray.sort((a, b) => b.amount - a.amount);
    setTopProducts(productsArray.slice(0, 10).map(item => ({
      ...item,
      formattedAmount: formatCurrency(item.amount)
    })));
    
  }, [transactions, dateRange]);
  
  // Format payment method strings for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'mpesa-stk': return 'M-Pesa STK';
      case 'mpesa-till': return 'M-Pesa Till';
      case 'pochi-la-biashara': return 'Pochi La Biashara';
      case 'bank-transfer': return 'Bank Transfer';
      case 'credit': return 'Credit';
      case 'other-custom': return 'Other';
      default: return method;
    }
  };
  
  // Get total sales amount
  const totalSales = filteredTransactions.reduce((sum, tx) => sum + tx.total, 0);
  
  // Get total number of transactions
  const totalTransactions = filteredTransactions.length;
  
  // Get average transaction value
  const avgTransactionValue = totalTransactions ? totalSales / totalTransactions : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DateRangePicker />
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={activeReport} onValueChange={(value: any) => setActiveReport(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select report" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Sales Overview</SelectItem>
              <SelectItem value="details">Transaction Details</SelectItem>
              <SelectItem value="byProduct">Sales by Product</SelectItem>
              <SelectItem value="byPaymentMethod">Payment Methods</SelectItem>
            </SelectContent>
          </Select>
          
          <ReportExport 
            data={activeReport === "details" ? filteredTransactions : 
                 activeReport === "byProduct" ? topProducts :
                 activeReport === "byPaymentMethod" ? paymentMethodBreakdown :
                 dailySales} 
            filename={`sales-${activeReport}-report`} 
          />
        </div>
      </div>
      
      {/* Sales Overview Report */}
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
                <CardDescription>Average Transaction</CardDescription>
                <CardTitle className="text-3xl text-green-500">{formatCurrency(avgTransactionValue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Per transaction average
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Transactions</CardDescription>
                <CardTitle className="text-3xl text-green-500">{totalTransactions}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Total completed transactions
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-2 justify-between items-start md:items-center">
                <CardTitle>Sales Trend</CardTitle>
                <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="View type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily View</SelectItem>
                    <SelectItem value="weekly">Weekly View</SelectItem>
                    <SelectItem value="monthly">Monthly View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px] w-full">
                {dailySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={dailySales}
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
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), "Sales"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#10b981" 
                        activeDot={{ r: 8 }} 
                        name="Sales Amount"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Transaction Details Report */}
      {activeReport === "details" && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Detailed list of all transactions in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>A list of your recent transactions</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.receiptNumber}</TableCell>
                      <TableCell>{format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{transaction.customerName || 'Walk-in Customer'}</TableCell>
                      <TableCell>{transaction.items.length} items</TableCell>
                      <TableCell>
                        {transaction.payments.map(p => formatPaymentMethod(p.method)).join(', ')}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.total)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No transactions found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Sales by Product Report */}
      {activeReport === "byProduct" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Revenue</CardTitle>
              <CardDescription>Highest selling products in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150}
                        tick={{fontSize: 12}}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="#10b981"
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Products by Quantity</CardTitle>
              <CardDescription>Products sold in highest quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topProducts}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150}
                        tick={{fontSize: 12}}
                      />
                      <Tooltip 
                        formatter={(value: any) => [value, "Units Sold"]}
                      />
                      <Bar 
                        dataKey="quantity" 
                        fill="#8884d8"
                        name="Quantity Sold"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Payment Method Report */}
      {activeReport === "byPaymentMethod" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Distribution</CardTitle>
              <CardDescription>Sales broken down by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {paymentMethodBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="method"
                        label={({ method, percent }) => `${method}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentMethodBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatCurrency(value), "Amount"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethodBreakdown.length > 0 ? (
                    paymentMethodBreakdown.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.count}</TableCell>
                        <TableCell className="text-right">{payment.formattedAmount}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td className="p-4 font-medium">Total</td>
                    <td className="p-4">{filteredTransactions.length}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(totalSales)}</td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
      
    </div>
  );
};

export default SalesReports;
