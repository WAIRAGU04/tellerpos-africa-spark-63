import { useMemo } from "react";
import { PaymentMethodTotals, Shift } from "@/types/shift";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface ActiveShiftDetailsProps {
  shift: Shift;
}
const ActiveShiftDetails = ({
  shift
}: ActiveShiftDetailsProps) => {
  const totalExpenses = useMemo(() => {
    return shift.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [shift.expenses]);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="space-y-4">
      <Card>
        <CardHeader className="bg-tellerpos-dark-accent/20 pb-2">
          <CardTitle className="text-lg text-green-500 font-bold">Active Shift Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Clock In Time</p>
              <p className="font-medium">{formatTime(shift.clockInTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shift Date</p>
              <p className="font-medium">{new Date(shift.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Opening Balance</p>
              <p className="font-medium">{formatCurrency(shift.openingBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Sales</p>
              <p className="font-medium">{formatCurrency(shift.totalSales)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="bg-tellerpos-dark-accent/20 pb-2">
            <CardTitle className="font-bold text-2xl text-green-500">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-2">
              {Object.entries(shift.paymentTotals).map(([method, amount]) => <li key={method} className="flex justify-between">
                  <span className="text-sm capitalize">{method === 'mpesaTill' ? 'Mpesa Till' : method === 'pochiBiashara' ? 'Pochi La Biashara' : method === 'bankTransfer' ? 'Bank Transfer' : method}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-tellerpos-dark-accent/20 pb-2">
            <CardTitle className="text-lg font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {shift.expenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses recorded</p> : <div>
                <ul className="space-y-2 mb-4">
                  {shift.expenses.map(expense => <li key={expense.id} className="flex justify-between">
                      <span className="text-sm">{expense.description}</span>
                      <span className="font-medium">{formatCurrency(expense.amount)}</span>
                    </li>)}
                </ul>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-medium">{formatCurrency(totalExpenses)}</span>
                </div>
              </div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-tellerpos-dark-accent/20 pb-2">
          <CardTitle className="text-lg font-medium">Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Opening Balance</span>
              <span className="font-medium">{formatCurrency(shift.openingBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Sales</span>
              <span className="font-medium">{formatCurrency(shift.totalSales)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Expenses</span>
              <span className="font-medium">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Expected Cash</span>
              <span className="font-medium">{formatCurrency(shift.openingBalance + shift.paymentTotals.cash - totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default ActiveShiftDetails;