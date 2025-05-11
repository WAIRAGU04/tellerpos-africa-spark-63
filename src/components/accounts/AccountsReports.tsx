
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatCurrency } from '@/lib/utils';
import { CalendarRange, Download, Users, FileText } from 'lucide-react';
import { ReportFilter } from '@/types/accounts';
import { Separator } from '@/components/ui/separator';
import { Transaction } from '@/types/pos';
import { Shift } from '@/types/shift';

const AccountsReports: React.FC = () => {
  // Get the current date and 30 days ago date for default range
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const [filter, setFilter] = useState<ReportFilter>({
    dateRange: {
      startDate: thirtyDaysAgo,
      endDate: today,
    },
    paymentMethods: undefined,
    userId: undefined,
    shiftId: undefined,
  });
  
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: today,
  });
  const [users, setUsers] = useState<Array<{id: string, name: string}>>([
    { id: '1', name: 'All Users' },
    { id: '2', name: 'John Doe' },
    { id: '3', name: 'Jane Smith' },
  ]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('1');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [reportData, setReportData] = useState<any>(null);

  // Load transactions and shifts from localStorage
  React.useEffect(() => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    
    const storedShifts = localStorage.getItem('shifts');
    if (storedShifts) {
      setShifts(JSON.parse(storedShifts));
    }
  }, []);

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setFilter(prev => ({
        ...prev,
        dateRange: {
          startDate: range.from,
          endDate: range.to,
        },
      }));
    }
  };

  const handleUserChange = (value: string) => {
    setSelectedUser(value);
    setFilter(prev => ({
      ...prev,
      userId: value === '1' ? undefined : value,
    }));
  };

  const handleShiftChange = (value: string) => {
    setSelectedShift(value);
    setFilter(prev => ({
      ...prev,
      shiftId: value === 'all' ? undefined : value,
    }));
  };

  const generateReport = () => {
    // Filter transactions based on user criteria
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.timestamp);
      
      // Filter by date range
      if (filter.dateRange.startDate && filter.dateRange.endDate) {
        if (transactionDate < filter.dateRange.startDate || transactionDate > filter.dateRange.endDate) {
          return false;
        }
      }
      
      // Filter by user if selected
      if (filter.userId && transaction.customerId !== filter.userId) {
        return false;
      }
      
      // Filter by shift if selected
      // Note: In a real app, transactions would have a shiftId property
      // This is a placeholder implementation
      
      return true;
    });
    
    // Generate report based on selected report type
    let reportSummary;
    
    if (selectedReport === 'sales') {
      // Calculate sales summary
      const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
      const salesByMethod: Record<string, number> = {};
      
      filteredTransactions.forEach(t => {
        t.payments.forEach(p => {
          if (!salesByMethod[p.method]) {
            salesByMethod[p.method] = 0;
          }
          salesByMethod[p.method] += p.amount;
        });
      });
      
      reportSummary = {
        title: 'Sales Report',
        totalTransactions: filteredTransactions.length,
        totalSales,
        salesByMethod,
        transactions: filteredTransactions,
      };
    } else if (selectedReport === 'accounts') {
      // Calculate accounts summary
      // In a real app, this would include balance changes, etc.
      reportSummary = {
        title: 'Accounts Report',
        transactions: filteredTransactions,
      };
    } else {
      reportSummary = {
        title: 'Custom Report',
        transactions: filteredTransactions,
      };
    }
    
    setReportData(reportSummary);
  };

  const exportReport = () => {
    if (!reportData) return;
    
    // Create a simple CSV from reportData
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    const headers = ['ID', 'Date', 'Amount', 'Status', 'Customer'];
    csvContent += headers.join(',') + '\n';
    
    // Add transaction rows
    reportData.transactions.forEach((t: Transaction) => {
      const row = [
        t.id,
        new Date(t.timestamp).toLocaleDateString(),
        t.total,
        t.status,
        t.customerName || 'N/A',
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportData.title}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="accounts">Accounts Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="customers">Customer Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User</label>
              <Select value={selectedUser} onValueChange={handleUserChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shift</label>
              <Select value={selectedShift} onValueChange={handleShiftChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  {shifts.map(shift => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {format(new Date(shift.date), "LLL dd, y")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={generateReport} className="w-full mt-4">
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{reportData.title}</CardTitle>
            <Button size="sm" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {reportData.totalTransactions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Transactions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatCurrency(reportData.totalSales || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      reportData.transactions?.filter((t: Transaction) => t.status === 'completed').length || 0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed Sales</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <h3 className="font-medium">Transactions</h3>
              {reportData.transactions?.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Customer</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.transactions.slice(0, 10).map((t: Transaction) => (
                      <tr key={t.id} className="border-b">
                        <td className="p-2">{t.receiptNumber}</td>
                        <td className="p-2">{new Date(t.timestamp).toLocaleDateString()}</td>
                        <td className="p-2">{t.customerName || 'Walk-in Customer'}</td>
                        <td className="p-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            t.status === 'completed' && "bg-green-100 text-green-800",
                            t.status === 'pending' && "bg-yellow-100 text-yellow-800",
                            t.status === 'cancelled' && "bg-red-100 text-red-800"
                          )}>
                            {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-2 text-right">{formatCurrency(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-muted-foreground py-4">No data found for the selected criteria</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountsReports;
