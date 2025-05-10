
import { useState } from "react";
import { Shift } from "@/types/shift";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActiveShiftDetails from "./ActiveShiftDetails";

interface ShiftHistoryProps {
  shifts: Shift[];
}

const ShiftHistory = ({ shifts }: ShiftHistoryProps) => {
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="bg-tellerpos-dark-accent/20">
          <CardTitle>Shift History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Opening Balance</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>{new Date(shift.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatTime(shift.clockInTime)}</TableCell>
                    <TableCell>{formatTime(shift.clockOutTime)}</TableCell>
                    <TableCell>{formatCurrency(shift.openingBalance)}</TableCell>
                    <TableCell>{formatCurrency(shift.totalSales)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          shift.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400"
                        }`}
                      >
                        {shift.status === "active" ? "Active" : "Closed"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedShift(shift)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {shifts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No shift history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedShift} onOpenChange={(open) => !open && setSelectedShift(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Shift Details - {selectedShift && new Date(selectedShift.date).toLocaleDateString()}</DialogTitle>
          </DialogHeader>
          {selectedShift && <ActiveShiftDetails shift={selectedShift} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShiftHistory;
