
import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/Index';
import DashboardPage from './pages/Dashboard';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFound';
import PlaceholderModulePage from './pages/PlaceholderModulePage';
import POSPage from './pages/POSPage';
import AccountsPage from './pages/AccountsPage';
import ShiftPage from './pages/ShiftPage';
import SalesPage from './pages/SalesPage';
import StockPage from './pages/StockPage';
import { ShiftProvider } from './contexts/ShiftContext';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from "./components/ui/toaster";
import { initializeAccounts } from './services/accountsService';
import { initializeOfflineStorage, initializeSyncService } from './services/syncService';

function App() {
  // Initialize accounts and offline functionality
  useEffect(() => {
    initializeAccounts();
    initializeOfflineStorage();
    initializeSyncService(); // Initialize sync service to handle online/offline transitions
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="tellerpos-ui-theme">
      <ShiftProvider>
        <Router>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/pos" element={<POSPage />} />
            <Route path="/dashboard/accounts" element={<AccountsPage />} />
            <Route path="/dashboard/shift" element={<ShiftPage />} />
            <Route path="/dashboard/sales" element={<SalesPage />} />
            <Route path="/dashboard/inventory" element={<StockPage />} />
            <Route path="/dashboard/:module" element={<PlaceholderModulePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </Router>
      </ShiftProvider>
    </ThemeProvider>
  );
}

export default App;
