
import React, { useState } from 'react';
import { Transaction } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';

interface EditStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onUpdateStatus: (status: "completed" | "pending" | "cancelled" | "paid" | "refunded") => void;
}

const EditStatusDialog: React.FC<EditStatusDialogProps> = ({
  open,
  onOpenChange,
  transaction,
  onUpdateStatus
}) => {
  const [newStatus, setNewStatus] = useState<"completed" | "pending" | "cancelled" | "paid" | "refunded">("pending");
  
  // Update the status state when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setNewStatus(transaction.status);
    }
  }, [transaction]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Invoice Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Invoice #{transaction?.receiptNumber}</h4>
            <p className="text-sm text-muted-foreground">
              Current status: <Badge variant="outline">{transaction?.status}</Badge>
            </p>
          </div>
          <div className="grid gap-2">
            <label htmlFor="status" className="text-sm font-medium">New Status</label>
            <Select 
              value={newStatus} 
              onValueChange={(value: "completed" | "pending" | "cancelled" | "paid" | "refunded") => setNewStatus(value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={() => onUpdateStatus(newStatus)}>
            <Check className="mr-2 h-4 w-4" />
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStatusDialog;
