
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShiftProvider } from "@/contexts/ShiftContext";
import { initializeAccounts } from '@/services/accountsService';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ShiftPage from "./pages/ShiftPage";
import StockPage from "./pages/StockPage";
import POSPage from "./pages/POSPage";
import SalesPage from "./pages/SalesPage";
import AccountsPage from "./pages/AccountsPage";
import PlaceholderModulePage from "./pages/PlaceholderModulePage";

const queryClient = new QueryClient();

const App = () => {
  // Initialize accounts on app load
  useEffect(() => {
    initializeAccounts();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ShiftProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/shift" element={<ShiftPage />} />
              <Route path="/dashboard/pos" element={<POSPage />} />
              <Route path="/dashboard/sales" element={<SalesPage />} />
              <Route path="/dashboard/stock" element={<StockPage />} />
              <Route path="/dashboard/accounts" element={<AccountsPage />} />
              <Route path="/dashboard/analytics" element={<PlaceholderModulePage />} />
              <Route path="/dashboard/users" element={<PlaceholderModulePage />} />
              <Route path="/dashboard/settings" element={<PlaceholderModulePage />} />
              <Route path="/dashboard/backoffice" element={<PlaceholderModulePage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ShiftProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
