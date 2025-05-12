
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Index from "./pages/Index";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import POSPage from "./pages/POSPage";
import SalesPage from "./pages/SalesPage";
import AccountsPage from "./pages/AccountsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ShiftPage from "./pages/ShiftPage";
import StockPage from "./pages/StockPage";
import PlaceholderModulePage from "./pages/PlaceholderModulePage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ui/theme-provider";
import { isAuthenticated } from "./utils/authUtils";
import { ProtectedRoute, AuthenticatedRoute } from "./utils/RouteProtection";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="tellerpos-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route 
            path="/signup" 
            element={
              <AuthenticatedRoute>
                <SignupPage />
              </AuthenticatedRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/pos" 
            element={
              <ProtectedRoute>
                <POSPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/sales" 
            element={
              <ProtectedRoute>
                <SalesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/accounts" 
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/shift" 
            element={
              <ProtectedRoute>
                <ShiftPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/stock" 
            element={
              <ProtectedRoute>
                <StockPage />
              </ProtectedRoute>
            }
          />

          {/* Placeholder route for other modules */}
          <Route 
            path="/dashboard/:module" 
            element={
              <ProtectedRoute>
                <PlaceholderModulePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch-all route for non-existing routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}

export default App;
