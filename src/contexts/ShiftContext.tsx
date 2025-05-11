
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Shift, PaymentMethodTotals } from '@/types/shift';
import { useToast } from "@/hooks/use-toast";
import { CartItem, PaymentMethod } from '@/types/pos';

type ShiftContextType = {
  activeShift: Shift | null;
  isLoading: boolean;
  startShift: (openingBalance: number) => void;
  closeShift: () => void;
  addExpense: (description: string, amount: number) => void;
  updateShiftWithSale: (items: CartItem[], paymentMethod: PaymentMethod, amount: number) => void;
};

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load active shift from localStorage on component mount
  useEffect(() => {
    const loadShift = async () => {
      try {
        // In a real application, this would fetch data from an API
        const storedActiveShift = localStorage.getItem("activeShift");
        if (storedActiveShift) {
          setActiveShift(JSON.parse(storedActiveShift));
        }
      } catch (error) {
        console.error("Error loading active shift:", error);
        toast({
          title: "Error",
          description: "Failed to load active shift data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShift();
  }, [toast]);
  
  // Start a new shift
  const startShift = (openingBalance: number) => {
    if (activeShift) {
      toast({
        title: "Shift already active",
        description: "Please close the current shift before starting a new one",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    const newShift: Shift = {
      id: Math.random().toString(36).substring(2, 9),
      openingBalance: openingBalance,
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
    localStorage.setItem("activeShift", JSON.stringify(newShift));
    
    toast({
      title: "Shift started",
      description: `Your shift has been started with an opening balance of KES ${openingBalance.toLocaleString()}.`
    });
  };
  
  // Close the current shift
  const closeShift = () => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "There is no active shift to close",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    const closedShift: Shift = {
      ...activeShift,
      status: "closed",
      closingBalance: calculateExpectedCash(activeShift),
      clockOutTime: now.toISOString()
    };
    
    // In a real application, we would save to backend
    // For now just save to localStorage for history
    const shiftHistory = JSON.parse(localStorage.getItem("shiftHistory") || "[]");
    shiftHistory.unshift(closedShift);
    localStorage.setItem("shiftHistory", JSON.stringify(shiftHistory));
    
    // Clear active shift
    setActiveShift(null);
    localStorage.removeItem("activeShift");
    
    toast({
      title: "Shift closed",
      description: "Your shift has been closed successfully",
    });
  };
  
  // Add an expense to the current shift
  const addExpense = (description: string, amount: number) => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "You need to start a shift before adding expenses",
        variant: "destructive",
      });
      return;
    }
    
    const newExpense = {
      id: Math.random().toString(36).substring(2, 9),
      description,
      amount,
      timestamp: new Date().toISOString()
    };
    
    const updatedShift = {
      ...activeShift,
      expenses: [...activeShift.expenses, newExpense]
    };
    
    setActiveShift(updatedShift);
    localStorage.setItem("activeShift", JSON.stringify(updatedShift));
    
    toast({
      title: "Expense added",
      description: `${description} - KES ${amount.toLocaleString()} added to current shift`
    });
  };
  
  // Map POS payment methods to shift payment methods
  const mapPaymentMethod = (posMethod: PaymentMethod): keyof PaymentMethodTotals => {
    switch (posMethod) {
      case 'cash': return 'cash';
      case 'mpesa-stk': return 'mpesa';
      case 'mpesa-till': return 'mpesaTill';
      case 'pochi-la-biashara': return 'pochiBiashara';
      case 'bank-transfer': return 'bankTransfer';
      case 'credit': return 'credit';
      case 'other-custom': return 'cash'; // Default to cash for custom methods
      default: return 'cash';
    }
  };
  
  // Update shift with a new sale
  const updateShiftWithSale = (
    items: CartItem[], 
    paymentMethod: PaymentMethod, 
    amount: number
  ) => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "You must start a shift before making sales",
        variant: "destructive",
      });
      return;
    }
    
    // Map the payment method from POS to shift payment method
    const shiftPaymentMethod = mapPaymentMethod(paymentMethod);
    
    // Update the payment totals and total sales
    const updatedPaymentTotals = { ...activeShift.paymentTotals };
    updatedPaymentTotals[shiftPaymentMethod] += amount;
    
    const updatedShift = {
      ...activeShift,
      paymentTotals: updatedPaymentTotals,
      totalSales: activeShift.totalSales + amount
    };
    
    setActiveShift(updatedShift);
    localStorage.setItem("activeShift", JSON.stringify(updatedShift));
  };
  
  // Helper to calculate expected cash
  const calculateExpectedCash = (shift: Shift) => {
    const totalExpenses = shift.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return shift.openingBalance + shift.paymentTotals.cash - totalExpenses;
  };
  
  const value = {
    activeShift,
    isLoading,
    startShift,
    closeShift,
    addExpense,
    updateShiftWithSale
  };
  
  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}

export const useShift = (): ShiftContextType => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};
