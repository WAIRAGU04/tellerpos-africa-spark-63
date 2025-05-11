
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ShiftProvider } from "@/contexts/ShiftContext";
import { initializeAccounts } from '@/services/accountsService';
import { cacheData, CACHE_KEYS } from '@/services/offlineService';
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
  // Initialize accounts and offline functionality on app load
  useEffect(() => {
    // Initialize accounts
    initializeAccounts();
    
    // Set initial sync time if not already set
    if (!localStorage.getItem('last_global_sync_time')) {
      const initialSyncTime = new Date().toISOString();
      localStorage.setItem('last_global_sync_time', initialSyncTime);
    }
    
    // Register service worker for offline functionality in a real PWA
    // (This is just a placeholder - actual implementation would require more setup)
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/service-worker.js')
        console.log('Service worker would be registered here in a production PWA');
      });
    }
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
