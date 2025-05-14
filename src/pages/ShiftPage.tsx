
import { useState, useEffect } from "react";
import { Shift, Expense, ShiftFormValues } from "@/types/shift";
import { Button } from "@/components/ui/button";
import StartShiftForm from "@/components/shift/StartShiftForm";
import ActiveShiftDetails from "@/components/shift/ActiveShiftDetails";
import ShiftHistory from "@/components/shift/ShiftHistory";
import ExpenseForm from "@/components/shift/ExpenseForm";
import CloseShiftDialog from "@/components/shift/CloseShiftDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShift } from "@/contexts/shift";

const ShiftPage = () => {
  const {
    activeShift,
    isLoading,
    startShift,
    closeShift,
    addExpense,
  } = useShift();
  const [shiftHistory, setShiftHistory] = useState<Shift[]>([]);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const {
    toast
  } = useToast();

  // Load shift history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("shiftHistory");
    if (storedHistory) {
      setShiftHistory(JSON.parse(storedHistory));
    }
  }, []);
  const handleStartShift = (values: ShiftFormValues) => {
    startShift(values.openingBalance);
  };
  const handleCloseShift = () => {
    closeShift();
    // Refresh shift history after closing
    const updatedHistory = localStorage.getItem("shiftHistory");
    if (updatedHistory) {
      setShiftHistory(JSON.parse(updatedHistory));
    }
  };
  const handleAddExpense = (expenseData: Omit<Expense, "id" | "timestamp">) => {
    addExpense(expenseData);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tellerpos mx-auto"></div>
            <p className="mt-2 text-tellerpos-gray-light">Loading shift data...</p>
          </div>
        </div>;
    }
    return <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl text-green-500 font-extrabold">Shift Management</h1>
            {activeShift && <div className="space-x-2">
                <Button variant="destructive" onClick={() => setIsCloseDialogOpen(true)}>
                  Close Shift
                </Button>
              </div>}
          </div>
          
          {activeShift ? <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-4 bg-green-400">
                <TabsTrigger value="details">Shift Details</TabsTrigger>
                <TabsTrigger value="expenses">Record Expenses</TabsTrigger>
                <TabsTrigger value="history">Shift History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <ActiveShiftDetails shift={activeShift} />
              </TabsContent>
              
              <TabsContent value="expenses">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ExpenseForm onAddExpense={handleAddExpense} />
                  
                  <div>
                    <h2 className="text-xl font-medium mb-4">Recent Expenses</h2>
                    {activeShift.expenses.length === 0 ? <p className="text-muted-foreground">No expenses recorded for this shift</p> : <ul className="space-y-2">
                        {activeShift.expenses.map(expense => <li key={expense.id} className="bg-tellerpos-dark-accent/20 p-3 rounded-md">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{expense.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(expense.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <p className="font-medium">
                                KES {expense.amount.toLocaleString()}
                              </p>
                            </div>
                          </li>)}
                      </ul>}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <ShiftHistory shifts={shiftHistory} />
              </TabsContent>
            </Tabs> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg mb-4 text-tellerpos-gray-light">
                  There is no active shift. Start a new shift to begin sales and record expenses.
                </p>
                <StartShiftForm onStartShift={handleStartShift} />
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-4">Previous Shifts</h2>
                <ShiftHistory shifts={shiftHistory} />
              </div>
            </div>}
          
          {activeShift && <CloseShiftDialog shift={activeShift} open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen} onCloseShift={handleCloseShift} />}
        </div>
      </div>;
  };
  return <DashboardLayout>
      {renderContent()}
    </DashboardLayout>;
};
export default ShiftPage;
