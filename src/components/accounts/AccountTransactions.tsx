
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { AccountTransaction } from '@/types/accounts';
import { formatCurrency } from '@/lib/utils';
import { Search, FileText } from 'lucide-react';
import { getAccounts, getTransactions } from '@/services/accountsService';
import { useIsMobile } from '@/hooks/use-mobile';

const AccountTransactions: React.FC<{ accountId?: string }> = ({ accountId }) => {
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [accounts, setAccounts] = useState<Record<string, string>>({});
  const [filteredTransactions, setFilteredTransactions] = useState<AccountTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedAccountId, setSelectedAccountId] = useState(accountId || 'all');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load all transactions
    const allTransactions = getTransactions();
    setTransactions(allTransactions);
    
    // Create a map of account IDs to names
    const accountsList = getAccounts();
    const accountsMap: Record<string, string> = {};
    accountsList.forEach(account => {
      accountsMap[account.id] = account.name;
    });
    setAccounts(accountsMap);
    
    // Set initial account selection if provided
    if (accountId) {
      setSelectedAccountId(accountId);
    }
  }, [accountId]);
  
  useEffect(() => {
    // Filter transactions based on search term, type, and account
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (transactionType !== 'all') {
      filtered = filtered.filter(tx => tx.type === transactionType);
    }
    
    if (selectedAccountId !== 'all') {
      filtered = filtered.filter(tx => tx.accountId === selectedAccountId);
    }
    
    // Sort by timestamp, newest first
    filtered = [...filtered].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, transactionType, selectedAccountId]);
  
  // Format transaction type for display
  const formatTransactionType = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="w-full md:w-48">
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!accountId && (
              <div className="w-full md:w-64">
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accounts</SelectItem>
                    {Object.entries(accounts).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          {filteredTransactions.length > 0 ? (
            isMobile ? (
              <div className="space-y-4">
                {filteredTransactions.map(tx => (
                  <Card key={tx.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{formatTransactionType(tx.type)}</p>
                        <p className="text-sm text-muted-foreground">{accounts[tx.accountId] || 'Unknown Account'}</p>
                      </div>
                      <p className={`font-bold ${tx.type === 'withdrawal' || tx.type === 'refund' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'withdrawal' || tx.type === 'refund' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm">{tx.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Ref: {tx.reference}</span>
                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableCaption>Account Transactions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map(tx => (
                    <TableRow key={tx.id}>
                      <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{formatTransactionType(tx.type)}</TableCell>
                      <TableCell>{accounts[tx.accountId] || 'Unknown Account'}</TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>{tx.reference}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'withdrawal' || tx.type === 'refund' ? 'text-red-500' : 'text-green-500'}`}>
                        {tx.type === 'withdrawal' || tx.type === 'refund' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTransactions;
