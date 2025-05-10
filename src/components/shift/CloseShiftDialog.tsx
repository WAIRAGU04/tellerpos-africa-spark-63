
import { useState } from "react";
import { Shift } from "@/types/shift";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CloseShiftDialogProps {
  shift: Shift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseShift: () => void;
}

const CloseShiftDialog = ({ shift, open, onOpenChange, onCloseShift }: CloseShiftDialogProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const { toast } = useToast();

  const handleCloseShift = async () => {
    setIsClosing(true);
    try {
      // In a real application, this would call an API to close the shift
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      onCloseShift();
      toast({
        title: "Shift closed successfully",
        description: "Your shift has been closed and recorded."
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error closing shift",
        description: "There was an error closing your shift. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClosing(false);
    }
  };

  // Calculate totals
  const totalExpenses = shift.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSales = shift.totalSales;
  const expectedCash = shift.openingBalance + shift.paymentTotals.cash - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Active Shift</DialogTitle>
          <DialogDescription>
            Review the details below before closing your shift. These values are calculated from the system and cannot be modified.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Opening Balance</p>
              <p className="font-medium">{formatCurrency(shift.openingBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="font-medium">{formatCurrency(totalSales)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cash Sales</p>
              <p className="font-medium">{formatCurrency(shift.paymentTotals.cash)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="font-medium">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between font-medium">
              <span>Expected Cash in Drawer</span>
              <span>{formatCurrency(expectedCash)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is the expected cash in your drawer based on opening balance, cash sales, and expenses.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isClosing}>
            Cancel
          </Button>
          <Button onClick={handleCloseShift} disabled={isClosing}>
            {isClosing ? "Closing..." : "Close Shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseShiftDialog;
