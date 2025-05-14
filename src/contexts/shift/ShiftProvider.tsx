
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Shift, PaymentMethodTotals, Expense } from '@/types/shift';
import { CartItem, PaymentMethod, Transaction } from '@/types/pos';
import { useToast } from "@/hooks/use-toast";
import { nanoid } from 'nanoid';
import { recordSaleInAccounts } from '@/services/accountsService';
import { ShiftContextType } from './shiftContextTypes';
import { calculateExpectedCash, mapPaymentMethod } from './shiftUtils';

// Create the context with undefined as initial value
export const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: React.ReactNode }) {
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
      id: nanoid(),
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
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'timestamp'>) => {
    if (!activeShift) return;

    const now = new Date();
    const newExpense: Expense = {
      ...expense,
      id: nanoid(),
      timestamp: now.toISOString()
    };

    setActiveShift(prevShift => {
      if (!prevShift) return null;
      
      const updatedShift: Shift = {
        ...prevShift,
        expenses: [...prevShift.expenses, newExpense]
      };
      
      // Save updated shift to localStorage
      localStorage.setItem("activeShift", JSON.stringify(updatedShift));
      return updatedShift;
    });
  }, [activeShift]);
  
  // Record a transaction in both the current shift and sales records
  const recordTransaction = (transaction: Transaction) => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "You must start a shift before making sales",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // Calculate total amount from payments
      const totalAmount = transaction.payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Update the payment totals in the shift
      const updatedPaymentTotals = { ...activeShift.paymentTotals };
      
      transaction.payments.forEach(payment => {
        const shiftPaymentMethod = mapPaymentMethod(payment.method);
        updatedPaymentTotals[shiftPaymentMethod] += payment.amount;
      });
      
      const updatedShift = {
        ...activeShift,
        paymentTotals: updatedPaymentTotals,
        totalSales: activeShift.totalSales + totalAmount
      };
      
      setActiveShift(updatedShift);
      localStorage.setItem("activeShift", JSON.stringify(updatedShift));
      
      // Record the sale in accounts
      recordSaleInAccounts(
        transaction.payments.map(p => ({ method: p.method, amount: p.amount })),
        transaction.id,
        activeShift.id
      );
      
      // Record the transaction in sales history
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const updatedTransaction = {
        ...transaction,
        shiftId: activeShift.id
      };
      transactions.unshift(updatedTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
      
      return true;
    } catch (error) {
      console.error("Error recording transaction:", error);
      toast({
        title: "Transaction error",
        description: "Failed to record the transaction",
        variant: "destructive",
      });
      return false;
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
    
    // Update accounts in real-time
    recordSaleInAccounts(
      [{ method: paymentMethod, amount }],
      `sale-${Date.now()}`,
      activeShift.id
    );
  };
  
  // Handle split payment sales
  const updateShiftWithSplitSale = (
    items: CartItem[],
    payments: Array<{method: PaymentMethod, amount: number}>
  ) => {
    if (!activeShift) {
      toast({
        title: "No active shift",
        description: "You must start a shift before making sales",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate total sale amount from all payments
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Update each payment method in the shift totals
    const updatedPaymentTotals = { ...activeShift.paymentTotals };
    
    payments.forEach(payment => {
      const shiftPaymentMethod = mapPaymentMethod(payment.method);
      updatedPaymentTotals[shiftPaymentMethod] += payment.amount;
    });
    
    const updatedShift = {
      ...activeShift,
      paymentTotals: updatedPaymentTotals,
      totalSales: activeShift.totalSales + totalAmount
    };
    
    setActiveShift(updatedShift);
    localStorage.setItem("activeShift", JSON.stringify(updatedShift));
    
    // Update accounts in real-time
    recordSaleInAccounts(
      payments,
      `split-sale-${Date.now()}`,
      activeShift.id
    );
  };
  
  const value = {
    activeShift,
    isLoading,
    startShift,
    closeShift,
    addExpense,
    updateShiftWithSale,
    updateShiftWithSplitSale,
    recordTransaction
  };
  
  return (
    <ShiftContext.Provider value={value}>
      {children}
    </ShiftContext.Provider>
  );
}
