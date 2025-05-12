
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DateRangePicker from "./DateRangePicker";
import { useDateRange } from "@/contexts/DateRangeContext";
import { formatCurrency } from "@/lib/utils";
import ReportExport from "./ReportExport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Transaction } from "@/types/pos";
import { Account, AccountTransaction, AccountTransfer } from "@/types/accounts";
import { Expense, Income, ShiftSummary } from "@/types/shift";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const FinancialReports: React.FC = () => {
  const { dateRange } = useDateRange();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [shifts, setShifts] = useState<ShiftSummary[]>([]);
  const [activeReport, setActiveReport] = useState<"summary" | "accounts" | "expenses" | "shifts" | "cash-flow">("summary");
  
  // Load data from localStorage
  useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    
    const storedAccounts = localStorage.getItem('accounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }
    
    const storedAccountTransactions = localStorage.getItem('accountTransactions');
    if (storedAccountTransactions) {
      setAccountTransactions(JSON.parse(storedAccountTransactions));
    }
    
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
    
    const storedIncomes = localStorage.getItem('incomes');
    if (storedIncomes) {
      setIncomes(JSON.parse(storedIncomes));
    }
    
    const storedShifts = localStorage.getItem('shiftHistory');
    if (storedShifts) {
      setShifts(JSON.parse(storedShifts));
    }
  }, []);
  
  // Filter data based on date range
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    return txDate >= dateRange.startDate && txDate <= dateRange.endDate;
  });
  
  const filteredAccountTransactions = accountTransactions.filter(tx => {
    const txDate = new Date(tx.timestamp);
    return txDate >= dateRange.startDate && txDate <= dateRange.endDate;
  });
  
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateRange.startDate && expenseDate <= dateRange.endDate;
  });
  
  const filteredIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.date);
    return incomeDate >= dateRange.startDate && incomeDate <= dateRange.endDate;
  });
  
  const filteredShifts = shifts.filter(shift => {
    const shiftStartDate = new Date(shift.startTime);
    const shiftEndDate = shift.endTime ? new Date(shift.endTime) : new Date();
    return (shiftStartDate >= dateRange.startDate && shiftStartDate <= dateRange.endDate) ||
           (shiftEndDate >= dateRange.startDate && shiftEndDate <= dateRange.endDate);
  });
  
  // Calculate total sales
  const totalSales = filteredTransactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.total, 0);
  
  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total income (other than sales)
  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  
  // Calculate profit
  const grossProfit = totalSales + totalIncome - totalExpenses;
  
  // Generate daily cash flow data
  const getDailyCashFlowData = () => {
    const dailyData = new Map();
    
    // Process sales
    filteredTransactions
      .filter(tx => tx.status === 'completed')
      .forEach(tx => {
        const day = format(new Date(tx.timestamp), 'yyyy-MM-dd');
        const existing = dailyData.get(day) || { day, sales: 0, expenses: 0, income: 0, profit: 0 };
        existing.sales += tx.total;
        existing.profit += tx.total;
        dailyData.set(day, existing);
      });
    
    // Process expenses
    filteredExpenses.forEach(expense => {
      const day = format(new Date(expense.date), 'yyyy-MM-dd');
      const existing = dailyData.get(day) || { day, sales: 0, expenses: 0, income: 0, profit: 0 };
      existing.expenses += expense.amount;
      existing.profit -= expense.amount;
      dailyData.set(day, existing);
    });
    
    // Process incomes
    filteredIncomes.forEach(income => {
      const day = format(new Date(income.date), 'yyyy-MM-dd');
      const existing = dailyData.get(day) || { day, sales: 0, expenses: 0, income: 0, profit: 0 };
      existing.income += income.amount;
      existing.profit += income.amount;
      dailyData.set(day, existing);
    });
    
    // Convert to array and sort by date
    const result = Array.from(dailyData.values());
    result.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
    
    return result.map(item => ({
      ...item,
      day: format(new Date(item.day), 'MMM dd'),
      formattedSales: formatCurrency(item.sales),
      formattedExpenses: formatCurrency(item.expenses),
      formattedIncome: formatCurrency(item.income),
      formattedProfit: formatCurrency(item.profit),
    }));
  };
  
  const cashFlowData = getDailyCashFlowData();
  
  // Format payment method for display
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
  
  // Group and sum transactions by payment method
  const getPaymentMethodSummary = () => {
    const summary = new Map();
    
    filteredTransactions
      .filter(tx => tx.status === 'completed')
      .forEach(tx => {
        tx.payments.forEach(payment => {
          const existingMethod = summary.get(payment.method) || { method: payment.method, amount: 0, count: 0 };
          existingMethod.amount += payment.amount;
          existingMethod.count += 1;
          summary.set(payment.method, existingMethod);
        });
      });
    
    return Array.from(summary.values())
      .map(item => ({
        ...item,
        method: formatPaymentMethod(item.method),
        formattedAmount: formatCurrency(item.amount),
        percentage: (item.amount / totalSales) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  };
  
  const paymentMethodSummary = getPaymentMethodSummary();
  
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
              <SelectItem value="summary">Financial Summary</SelectItem>
              <SelectItem value="accounts">Account Status</SelectItem>
              <SelectItem value="expenses">Expenses</SelectItem>
              <SelectItem value="shifts">Shift Summary</SelectItem>
              <SelectItem value="cash-flow">Cash Flow</SelectItem>
            </SelectContent>
          </Select>
          
          <ReportExport 
            data={
              activeReport === "summary" ? [
                { 
                  totalSales, 
                  totalExpenses, 
                  totalIncome, 
                  grossProfit, 
                  startDate: format(dateRange.startDate, 'yyyy-MM-dd'), 
                  endDate: format(dateRange.endDate, 'yyyy-MM-dd') 
                }
              ] : 
              activeReport === "accounts" ? accounts : 
              activeReport === "expenses" ? filteredExpenses : 
              activeReport === "shifts" ? filteredShifts :
              cashFlowData
            } 
            filename={`financial-${activeReport}-report`} 
          />
        </div>
      </div>
      
      {/* Financial Summary Report */}
      {activeReport === "summary" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Sales</CardDescription>
                <CardTitle className="text-3xl text-green-500">{formatCurrency(totalSales)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {filteredTransactions.filter(tx => tx.status === 'completed').length} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Expenses</CardDescription>
                <CardTitle className="text-3xl text-red-500">{formatCurrency(totalExpenses)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {filteredExpenses.length} expense entries
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Other Income</CardDescription>
                <CardTitle className="text-3xl text-blue-500">{formatCurrency(totalIncome)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {filteredIncomes.length} income entries
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Gross Profit</CardDescription>
                <CardTitle className={`text-3xl ${grossProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(grossProfit)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {Math.round((grossProfit / (totalSales + totalIncome || 1)) * 100)}% margin
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Payment Method</CardTitle>
                <CardDescription>Distribution of sales across different payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {paymentMethodSummary.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodSummary}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="method"
                          label={({ method, percentage }) => `${method}: ${percentage.toFixed(1)}%`}
                        >
                          {paymentMethodSummary.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [formatCurrency(value), "Amount"]} />
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
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Detailed breakdown of payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentMethodSummary.length > 0 ? (
                      paymentMethodSummary.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.method}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell className="text-right">{item.formattedAmount}</TableCell>
                          <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <tfoot>
                    <tr>
                      <td className="p-4 font-medium">Total</td>
                      <td className="p-4">{filteredTransactions.filter(tx => tx.status === 'completed').length}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(totalSales)}</td>
                      <td className="p-4 text-right font-medium">100%</td>
                    </tr>
                  </tfoot>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Account Status Report */}
      {activeReport === "accounts" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Account Balances</CardTitle>
              <CardDescription>Current balance of all accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {accounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={accounts.map(account => ({
                        ...account,
                        name: account.name,
                        type: formatPaymentMethod(account.type),
                        formattedBalance: formatCurrency(account.balance)
                      }))}
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
                      <Tooltip formatter={(value: any) => [formatCurrency(value), "Balance"]} />
                      <Legend />
                      <Bar dataKey="balance" fill="#10b981" name="Balance" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No account data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Account balances as of {new Date().toLocaleDateString()}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.length > 0 ? (
                    accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{formatPaymentMethod(account.type)}</TableCell>
                        <TableCell>{format(new Date(account.lastUpdated), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No account data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td className="p-4 font-medium" colSpan={3}>Total Balance</td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(accounts.reduce((sum, account) => sum + account.balance, 0))}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Account Transactions</CardTitle>
              <CardDescription>Transactions during selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Recent account transactions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccountTransactions.length > 0 ? (
                    filteredAccountTransactions
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 10)
                      .map((tx) => {
                        const account = accounts.find(a => a.id === tx.accountId);
                        return (
                          <TableRow key={tx.id}>
                            <TableCell>{format(new Date(tx.timestamp), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{account?.name || 'Unknown Account'}</TableCell>
                            <TableCell>{tx.type}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell className={`text-right ${tx.type === 'deposit' || tx.type === 'sale' ? 'text-green-500' : 'text-red-500'}`}>
                              {tx.type === 'deposit' || tx.type === 'sale' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No transactions found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Expenses Report */}
      {activeReport === "expenses" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {filteredExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Array.from(
                            filteredExpenses.reduce((acc, expense) => {
                              const category = expense.category || 'Uncategorized';
                              const existingCategory = acc.get(category) || { category, amount: 0 };
                              existingCategory.amount += expense.amount;
                              acc.set(category, existingCategory);
                              return acc;
                            }, new Map())
                            .values()
                          )}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="category"
                          label={({ category, amount, percent }) => 
                            `${category}: ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {Array.from(
                            filteredExpenses.reduce((acc, expense) => {
                              const category = expense.category || 'Uncategorized';
                              const existingCategory = acc.get(category) || { category, amount: 0 };
                              existingCategory.amount += expense.amount;
                              acc.set(category, existingCategory);
                              return acc;
                            }, new Map())
                            .values()
                          ).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [formatCurrency(value), "Amount"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No expense data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Trend</CardTitle>
                <CardDescription>Daily expense breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {filteredExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={Array.from(
                          filteredExpenses.reduce((acc, expense) => {
                            const day = format(new Date(expense.date), 'yyyy-MM-dd');
                            const existingDay = acc.get(day) || { day, amount: 0 };
                            existingDay.amount += expense.amount;
                            acc.set(day, existingDay);
                            return acc;
                          }, new Map())
                          .values()
                        )
                        .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
                        .map(item => ({
                          ...item,
                          day: format(new Date(item.day), 'MMM dd'),
                        }))}
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
                        <Tooltip formatter={(value: any) => [formatCurrency(value), "Expenses"]} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#ef4444" activeDot={{ r: 8 }} name="Expenses" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">No expense data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
              <CardDescription>List of all expenses in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Expenses for selected period</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{expense.category || 'Uncategorized'}</TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>{formatPaymentMethod(expense.paymentMethod)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No expenses found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td className="p-4 font-medium" colSpan={4}>Total Expenses</td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(totalExpenses)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Shift Summary Report */}
      {activeReport === "shifts" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Shift Performance</CardTitle>
              <CardDescription>Sales and expenses by shift</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {filteredShifts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={filteredShifts
                        .filter(shift => shift.endTime) // Only include closed shifts
                        .map(shift => ({
                          ...shift,
                          shiftId: `Shift #${shift.shiftNumber}`,
                          date: format(new Date(shift.startTime), 'MMM dd'),
                          profit: shift.totalSales - shift.totalExpenses,
                        }))}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="shiftId" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any, name: any) => [
                          formatCurrency(value), 
                          name === "totalSales" ? "Sales" : 
                          name === "totalExpenses" ? "Expenses" : 
                          "Profit"
                        ]} 
                      />
                      <Legend />
                      <Bar dataKey="totalSales" fill="#10b981" name="Sales" />
                      <Bar dataKey="totalExpenses" fill="#ef4444" name="Expenses" />
                      <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No shift data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Shift Summary</CardTitle>
              <CardDescription>Details of all shifts in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Shift summary for selected period</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shift #</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShifts.length > 0 ? (
                    filteredShifts
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell>{shift.shiftNumber}</TableCell>
                          <TableCell>{format(new Date(shift.startTime), 'MMM dd, HH:mm')}</TableCell>
                          <TableCell>
                            {shift.endTime ? format(new Date(shift.endTime), 'MMM dd, HH:mm') : 'Active'}
                          </TableCell>
                          <TableCell>{formatCurrency(shift.totalSales)}</TableCell>
                          <TableCell>{formatCurrency(shift.totalExpenses)}</TableCell>
                          <TableCell>{shift.transactionCount}</TableCell>
                          <TableCell className={`text-right ${shift.totalSales >= shift.totalExpenses ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(shift.totalSales - shift.totalExpenses)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">No shifts found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td className="p-4 font-medium" colSpan={3}>Total</td>
                    <td className="p-4">{formatCurrency(filteredShifts.reduce((sum, shift) => sum + shift.totalSales, 0))}</td>
                    <td className="p-4">{formatCurrency(filteredShifts.reduce((sum, shift) => sum + shift.totalExpenses, 0))}</td>
                    <td className="p-4">{filteredShifts.reduce((sum, shift) => sum + shift.transactionCount, 0)}</td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(
                        filteredShifts.reduce((sum, shift) => sum + shift.totalSales - shift.totalExpenses, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Cash Flow Report */}
      {activeReport === "cash-flow" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>Daily breakdown of income and expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {cashFlowData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={cashFlowData}
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
                        formatter={(value: any, name: any) => [
                          formatCurrency(value),
                          name === "sales" ? "Sales" :
                          name === "expenses" ? "Expenses" :
                          name === "income" ? "Other Income" :
                          "Profit"
                        ]} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#10b981" activeDot={{ r: 8 }} name="Sales" />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" activeDot={{ r: 8 }} name="Expenses" />
                      <Line type="monotone" dataKey="income" stroke="#3b82f6" activeDot={{ r: 8 }} name="Other Income" />
                      <Line type="monotone" dataKey="profit" stroke="#8884d8" activeDot={{ r: 8 }} name="Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No cash flow data available for the selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Daily Cash Flow</CardTitle>
              <CardDescription>Detailed daily breakdown of income, expenses and profit</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>Cash flow for selected period</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Other Income</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowData.length > 0 ? (
                    cashFlowData
                      .map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{day.day}</TableCell>
                          <TableCell>{formatCurrency(day.sales)}</TableCell>
                          <TableCell>{formatCurrency(day.expenses)}</TableCell>
                          <TableCell>{formatCurrency(day.income)}</TableCell>
                          <TableCell className={`text-right ${day.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(day.profit)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No cash flow data found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td className="p-4 font-medium">Total</td>
                    <td className="p-4">{formatCurrency(cashFlowData.reduce((sum, day) => sum + day.sales, 0))}</td>
                    <td className="p-4">{formatCurrency(cashFlowData.reduce((sum, day) => sum + day.expenses, 0))}</td>
                    <td className="p-4">{formatCurrency(cashFlowData.reduce((sum, day) => sum + day.income, 0))}</td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(cashFlowData.reduce((sum, day) => sum + day.profit, 0))}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FinancialReports;
