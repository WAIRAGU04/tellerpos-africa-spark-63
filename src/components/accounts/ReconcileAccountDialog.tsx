
import React, { useState, useEffect } from 'react';
import { Account } from '@/types/accounts';
import { formatCurrency } from '@/lib/utils';
import { updateAccountBalance } from '@/services/accountsService';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface ReconcileAccountDialogProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onReconcile: () => void;
}

const ReconcileAccountDialog: React.FC<ReconcileAccountDialogProps> = ({
  open,
  onClose,
  accounts,
  onReconcile
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [actualBalance, setActualBalance] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [difference, setDifference] = useState<number>(0);

  // Update selected account when selection changes
  useEffect(() => {
    if (selectedAccountId) {
      const account = accounts.find(acc => acc.id === selectedAccountId);
      if (account) {
        setSelectedAccount(account);
        setActualBalance(account.balance.toString());
      }
    } else {
      setSelectedAccount(null);
      setActualBalance('');
    }
    setDifference(0);
  }, [selectedAccountId, accounts]);

  // Calculate difference when actual balance changes
  useEffect(() => {
    if (selectedAccount && actualBalance) {
      const actualNum = parseFloat(actualBalance) || 0;
      setDifference(actualNum - selectedAccount.balance);
    } else {
      setDifference(0);
    }
  }, [actualBalance, selectedAccount]);

  const handleSubmit = () => {
    if (!selectedAccount || !actualBalance) {
      toast({
        title: "Validation Error",
        description: "Please select an account and enter the actual balance",
        variant: "destructive",
      });
      return;
    }

    const actualNum = parseFloat(actualBalance);
    if (isNaN(actualNum)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for the actual balance",
        variant: "destructive",
      });
      return;
    }

    if (difference === 0) {
      toast({
        title: "No Adjustment Needed",
        description: "The account balance already matches the actual balance",
      });
      onClose();
      return;
    }

    // Determine adjustment type based on difference
    const transactionType = difference > 0 ? 'adjustment' : 'adjustment';
    const adjustmentAmount = Math.abs(difference);
    const adjustmentDesc = `Account reconciliation: ${notes || 'Balance adjustment'}`;

    // Update account with adjustment
    const success = updateAccountBalance(
      selectedAccount.id,
      adjustmentAmount,
      transactionType,
      adjustmentDesc,
      `reconcile-${Date.now()}`,
      undefined,
      'current-user'
    );

    if (success) {
      toast({
        title: "Account Reconciled",
        description: `${selectedAccount.name} has been successfully reconciled with an adjustment of ${formatCurrency(adjustmentAmount)}`,
      });
      onReconcile();
      onClose();
      resetForm();
    } else {
      toast({
        title: "Reconciliation Failed",
        description: "There was an error reconciling the account",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedAccountId('');
    setActualBalance('');
    setNotes('');
    setSelectedAccount(null);
    setDifference(0);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reconcile Account</DialogTitle>
          <DialogDescription>
            Adjust account balances to match actual counts or statements.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="account">Select Account</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select account to reconcile" />
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
          
          {selectedAccount && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="system-balance">System Balance</Label>
                <Input
                  id="system-balance"
                  value={selectedAccount?.balance || ''}
                  readOnly
                  disabled
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="actual-balance">Actual Balance</Label>
                <Input
                  id="actual-balance"
                  type="number"
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              {difference !== 0 && (
                <div className="py-2 px-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">
                    Difference: <span className={difference > 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatCurrency(difference)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {difference > 0 ? 'The system balance will increase' : 'The system balance will decrease'}
                  </p>
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add reconciliation notes or explanation"
                  className="resize-none"
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Reconcile Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReconcileAccountDialog;
