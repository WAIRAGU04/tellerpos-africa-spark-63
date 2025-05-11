
import React, { useState, useEffect } from 'react';
import { Account, AccountTransfer } from '@/types/accounts';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Transfer, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const AccountsTransfers: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<AccountTransfer[]>([]);
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load accounts from localStorage
    const storedAccounts = localStorage.getItem('accounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts));
    }

    // Load transfers from localStorage
    const storedTransfers = localStorage.getItem('accountTransfers');
    if (storedTransfers) {
      setTransfers(JSON.parse(storedTransfers));
    }

    setIsLoading(false);
  }, []);

  const handleTransfer = () => {
    if (!fromAccountId || !toAccountId || !amount || fromAccountId === toAccountId) {
      toast({
        title: "Invalid transfer",
        description: "Please select different accounts and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid positive amount",
        variant: "destructive",
      });
      return;
    }

    // Find accounts
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);

    if (!fromAccount || !toAccount) {
      toast({
        title: "Account not found",
        description: "One or more selected accounts do not exist",
        variant: "destructive",
      });
      return;
    }

    // Check if source account has sufficient balance
    if (fromAccount.balance < amountValue) {
      toast({
        title: "Insufficient funds",
        description: `${fromAccount.name} has insufficient funds for this transfer`,
        variant: "destructive",
      });
      return;
    }

    // Create transfer record
    const newTransfer: AccountTransfer = {
      id: nanoid(),
      fromAccountId,
      toAccountId,
      amount: amountValue,
      timestamp: new Date().toISOString(),
      description: description || `Transfer from ${fromAccount.name} to ${toAccount.name}`,
      userId: "current-user-id" // In a real app, this would come from auth context
    };

    // Update account balances
    const updatedAccounts = accounts.map(acc => {
      if (acc.id === fromAccountId) {
        return { ...acc, balance: acc.balance - amountValue, lastUpdated: new Date().toISOString() };
      }
      if (acc.id === toAccountId) {
        return { ...acc, balance: acc.balance + amountValue, lastUpdated: new Date().toISOString() };
      }
      return acc;
    });

    // Update state and localStorage
    setAccounts(updatedAccounts);
    setTransfers([newTransfer, ...transfers]);
    localStorage.setItem('accounts', JSON.stringify(updatedAccounts));
    localStorage.setItem('accountTransfers', JSON.stringify([newTransfer, ...transfers]));

    // Reset form
    setAmount('');
    setDescription('');
    
    toast({
      title: "Transfer successful",
      description: `${formatCurrency(amountValue)} transferred successfully`,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Transfer className="mr-2 h-5 w-5" />
            Transfer Between Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="fromAccount">From Account</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger id="fromAccount">
                  <SelectValue placeholder="Select source account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end justify-center">
              <ArrowRight className="h-6 w-6" />
            </div>
            
            <div>
              <Label htmlFor="toAccount">To Account</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger id="toAccount">
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Transfer reason or reference"
                className="resize-none"
              />
            </div>
          </div>
          
          <Button onClick={handleTransfer} className="w-full mt-6">
            Complete Transfer
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Transfers</h3>
        
        {transfers.length > 0 ? (
          <Table>
            <TableCaption>A list of your recent account transfers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.slice(0, 10).map((transfer) => {
                const fromAccount = accounts.find(acc => acc.id === transfer.fromAccountId);
                const toAccount = accounts.find(acc => acc.id === transfer.toAccountId);
                
                return (
                  <TableRow key={transfer.id}>
                    <TableCell>{new Date(transfer.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{fromAccount?.name || 'Unknown Account'}</TableCell>
                    <TableCell>{toAccount?.name || 'Unknown Account'}</TableCell>
                    <TableCell>{formatCurrency(transfer.amount)}</TableCell>
                    <TableCell>{transfer.description}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <p className="text-center text-muted-foreground">No transfers found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AccountsTransfers;
