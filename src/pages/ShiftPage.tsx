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
import { nanoid } from "nanoid";

// Mock data for initial state
const mockShiftHistory: Shift[] = [
  {
    id: "shift-001",
    openingBalance: 5000,
    closingBalance: 12500,
    status: "closed",
    paymentTotals: {
      mpesa: 15000,
      mpesaTill: 8000,
      pochiBiashara: 2000,
      card: 5000,
      bankTransfer: 3000,
      cash: 10000,
      credit: 0
    },
    expenses: [
      {
        id: "exp-001",
        description: "Lunch for staff",
        amount: 1500,
        timestamp: "2025-05-05T12:30:00Z"
      },
      {
        id: "exp-002",
        description: "Transport",
        amount: 1000,
        timestamp: "2025-05-05T15:45:00Z"
      }
    ],
    totalSales: 43000,
    clockInTime: "2025-05-05T08:00:00Z",
    clockOutTime: "2025-05-05T17:00:00Z",
    date: "2025-05-05T00:00:00Z",
    userId: "user-001"
  },
  {
    id: "shift-002",
    openingBalance: 12500,
    closingBalance: 18000,
    status: "closed",
    paymentTotals: {
      mpesa: 20000,
      mpesaTill: 5000,
      pochiBiashara: 3000,
      card: 8000,
      bankTransfer: 0,
      cash: 7000,
      credit: 2000
    },
    expenses: [
      {
        id: "exp-003",
        description: "Office supplies",
        amount: 1500,
        timestamp: "2025-05-06T10:15:00Z"
      }
    ],
    totalSales: 45000,
    clockInTime: "2025-05-06T08:30:00Z",
    clockOutTime: "2025-05-06T17:30:00Z",
    date: "2025-05-06T00:00:00Z",
    userId: "user-001"
  }
];

const ShiftPage = () => {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [shiftHistory, setShiftHistory] = useState<Shift[]>(mockShiftHistory);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const { toast } = useToast();

  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      // In a real application, this would fetch data from an API
      await new Promise(resolve => setTimeout(resolve, 800));

      // For demonstration, let's check if we have an active shift in localStorage
      const storedActiveShift = localStorage.getItem("activeShift");
      if (storedActiveShift) {
        setActiveShift(JSON.parse(storedActiveShift));
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  const startShift = (values: ShiftFormValues) => {
    const now = new Date();
    const newShift: Shift = {
      id: nanoid(),
      openingBalance: values.openingBalance,
      status: "active",
      paymentTotals: {
        mpesa: 0,
        mpesaTill: 0,
        pochiBiashara: 0,
        card: 0,
        bankTransfer: 0,
        cash: 0,
        credit: 0
      },
      expenses: [],
      totalSales: 0,
      clockInTime: now.toISOString(),
      date: now.toISOString().split('T')[0] + 'T00:00:00Z',
      userId: "user-001" // In a real app, this would be the logged-in user's ID
    };

    setActiveShift(newShift);
    
    // In a real application, save to backend
    // For demo, save to localStorage
    localStorage.setItem("activeShift", JSON.stringify(newShift));
    
    toast({
      title: "Shift started",
      description: `Your shift has been started with an opening balance of KES ${values.openingBalance.toLocaleString()}.`
    });
  };

  const closeShift = () => {
    if (!activeShift) return;

    const now = new Date();
    const closedShift: Shift = {
      ...activeShift,
      status: "closed",
      closingBalance: calculateExpectedCash(activeShift),
      clockOutTime: now.toISOString()
    };

    // Update shift history with the closed shift
    setShiftHistory(prev => [closedShift, ...prev]);
    setActiveShift(null);
    
    // In a real application, save to backend
    // For demo, remove from localStorage
    localStorage.removeItem("activeShift");
  };

  const addExpense = (expenseData: Omit<Expense, "id" | "timestamp">) => {
    if (!activeShift) return;

    const newExpense: Expense = {
      ...expenseData,
      id: nanoid(),
      timestamp: new Date().toISOString()
    };

    const updatedShift = {
      ...activeShift,
      expenses: [...activeShift.expenses, newExpense]
    };

    setActiveShift(updatedShift);
    
    // In a real application, save to backend
    // For demo, save to localStorage
    localStorage.setItem("activeShift", JSON.stringify(updatedShift));
  };

  // Helper to calculate expected cash
  const calculateExpectedCash = (shift: Shift) => {
    const totalExpenses = shift.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return shift.openingBalance + shift.paymentTotals.cash - totalExpenses;
  };

  // Mock function to simulate updating sales (in a real app this would happen automatically)
  const simulateSale = () => {
    if (!activeShift) return;
    
    // Random sale amount between 1000 and 10000
    const saleAmount = Math.floor(Math.random() * 9000) + 1000;
    
    // Randomly select a payment method
    const paymentMethods = ['mpesa', 'mpesaTill', 'pochiBiashara', 'card', 'bankTransfer', 'cash', 'credit'] as const;
    const randomIndex = Math.floor(Math.random() * paymentMethods.length);
    const paymentMethod = paymentMethods[randomIndex];
    
    const updatedPaymentTotals = {
      ...activeShift.paymentTotals,
      [paymentMethod]: activeShift.paymentTotals[paymentMethod] + saleAmount
    };
    
    const updatedShift = {
      ...activeShift,
      paymentTotals: updatedPaymentTotals,
      totalSales: activeShift.totalSales + saleAmount
    };
    
    setActiveShift(updatedShift);
    localStorage.setItem("activeShift", JSON.stringify(updatedShift));
    
    toast({
      title: "Sale recorded",
      description: `KES ${saleAmount.toLocaleString()} sale recorded via ${paymentMethod === 'mpesaTill' ? 'Mpesa Till' : 
        paymentMethod === 'pochiBiashara' ? 'Pochi La Biashara' : 
        paymentMethod === 'bankTransfer' ? 'Bank Transfer' : 
        paymentMethod}`
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tellerpos mx-auto"></div>
            <p className="mt-2 text-tellerpos-gray-light">Loading shift data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Shift Management</h1>
            {activeShift && (
              <div className="space-x-2">
                <Button variant="outline" onClick={simulateSale}>
                  Simulate Sale (Demo)
                </Button>
                <Button variant="destructive" onClick={() => setIsCloseDialogOpen(true)}>
                  Close Shift
                </Button>
              </div>
            )}
          </div>
          
          {activeShift ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Shift Details</TabsTrigger>
                <TabsTrigger value="expenses">Record Expenses</TabsTrigger>
                <TabsTrigger value="history">Shift History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                <ActiveShiftDetails shift={activeShift} />
              </TabsContent>
              
              <TabsContent value="expenses">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ExpenseForm onAddExpense={addExpense} />
                  
                  <div>
                    <h2 className="text-xl font-medium mb-4">Recent Expenses</h2>
                    {activeShift.expenses.length === 0 ? (
                      <p className="text-muted-foreground">No expenses recorded for this shift</p>
                    ) : (
                      <ul className="space-y-2">
                        {activeShift.expenses.map(expense => (
                          <li key={expense.id} className="bg-tellerpos-dark-accent/20 p-3 rounded-md">
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
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <ShiftHistory shifts={shiftHistory} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg mb-4 text-tellerpos-gray-light">
                  There is no active shift. Start a new shift to begin sales and record expenses.
                </p>
                <StartShiftForm onStartShift={startShift} />
              </div>
              
              <div>
                <h2 className="text-xl font-medium mb-4">Previous Shifts</h2>
                <ShiftHistory shifts={shiftHistory} />
              </div>
            </div>
          )}
          
          {activeShift && (
            <CloseShiftDialog
              shift={activeShift}
              open={isCloseDialogOpen}
              onOpenChange={setIsCloseDialogOpen}
              onCloseShift={closeShift}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default ShiftPage;
