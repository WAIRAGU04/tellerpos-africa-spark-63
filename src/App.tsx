
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import POSPage from "./pages/POSPage";
import SalesPage from "./pages/SalesPage";
import ShiftPage from "./pages/ShiftPage";
import StockPage from "./pages/StockPage";
import AccountsPage from "./pages/AccountsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import PlaceholderModulePage from "./pages/PlaceholderModulePage";
import UserManagementPage from "./pages/UserManagementPage";
import { ShiftProvider } from "./contexts/shift";
import { UserProvider } from "./contexts/UserContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { ProtectedRoute, AuthenticatedRoute } from "./utils/RouteProtection";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="tellerpos-ui-theme">
      <UserProvider>
        <ShiftProvider>
          <AnalyticsProvider>
            <Router>
              <Toaster position="top-right" />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route 
                  path="/signup" 
                  element={
                    <AuthenticatedRoute>
                      <SignupPage />
                    </AuthenticatedRoute>
                  } 
                />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/users" 
                  element={
                    <ProtectedRoute>
                      <UserManagementPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pos" 
                  element={
                    <ProtectedRoute>
                      <POSPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/sales" 
                  element={
                    <ProtectedRoute>
                      <SalesPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/shift" 
                  element={
                    <ProtectedRoute>
                      <ShiftPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/inventory" 
                  element={
                    <ProtectedRoute>
                      <StockPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/accounts" 
                  element={
                    <ProtectedRoute>
                      <AccountsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Placeholder routes for modules */}
                <Route 
                  path="/dashboard/:module" 
                  element={
                    <ProtectedRoute>
                      <PlaceholderModulePage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </AnalyticsProvider>
        </ShiftProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
