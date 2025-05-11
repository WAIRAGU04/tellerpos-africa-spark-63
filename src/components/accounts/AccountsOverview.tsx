import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Account, AccountSummary, AccountTransaction } from '@/types/accounts';
import { PaymentMethod } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { CircleDollarSign, CreditCard, Wallet, Banknote, ArrowUpDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getAccounts, getTransactions } from '@/services/accountsService';

const AccountsOverview: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [summary, setSummary] = useState<AccountSummary>({
    totalCash: 0,
    totalMpesa: 0,
    totalBankTransfer: 0,
    totalCredit: 0,
    totalSales: 0,
    totalRefunds: 0,
    netSales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccountsData = () => {
      // Get accounts
      const loadedAccounts = getAccounts();
      setAccounts(loadedAccounts);
      
      // Get transactions
      const loadedTransactions = getTransactions();
      setTransactions(loadedTransactions);
      
      // Calculate summary from transactions
      const calculatedSummary = calculateSummary(loadedAccounts, loadedTransactions);
      setSummary(calculatedSummary);
      
      setIsLoading(false);
    };
    
    loadAccountsData();
  }, []);
  
  // Calculate summary from accounts and transactions
  const calculateSummary = (accounts: Account[], transactions: AccountTransaction[]): AccountSummary => {
    const summary: AccountSummary = {
      totalCash: accounts.find(a => a.type === 'cash')?.balance || 0,
      totalMpesa: accounts.filter(a => a.type.includes('mpesa') || a.type === 'pochi-la-biashara')
                         .reduce((sum, a) => sum + a.balance, 0),
      totalBankTransfer: accounts.find(a => a.type === 'bank-transfer')?.balance || 0,
      totalCredit: accounts.find(a => a.type === 'credit')?.balance || 0,
      totalSales: 0,
      totalRefunds: 0,
      netSales: 0
    };
    
    // Calculate sales and refunds from transactions
    transactions.forEach(transaction => {
      if (transaction.type === 'sale') {
        summary.totalSales += transaction.amount;
      } else if (transaction.type === 'refund') {
        summary.totalRefunds += transaction.amount;
      }
    });
    
    // Calculate net sales
    summary.netSales = summary.totalSales - summary.totalRefunds;
    
    return summary;
  };

  const getAccountIcon = (type: PaymentMethod) => {
    switch (type) {
      case 'cash':
        return <Banknote className="h-5 w-5" />;
      case 'mpesa-stk':
      case 'mpesa-till':
      case 'pochi-la-biashara':
        return <Wallet className="h-5 w-5" />;
      case 'bank-transfer':
        return <CircleDollarSign className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <CircleDollarSign className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</div>
            <p className="text-xs text-muted-foreground">Overall business revenue</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Sales</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.netSales)}</div>
            <p className="text-xs text-muted-foreground">Sales after refunds</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalCash)}
            </div>
            <p className="text-xs text-muted-foreground">Physical cash on hand</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">M-PESA Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalMpesa)}
            </div>
            <p className="text-xs text-muted-foreground">Combined mobile money</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Accounts</h2>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Reconcile
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    {getAccountIcon(account.type)}
                    {account.name}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(account.lastUpdated).toLocaleString()}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" className="w-full" size="sm">View Transactions</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountsOverview;
