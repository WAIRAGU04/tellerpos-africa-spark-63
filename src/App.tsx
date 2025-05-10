
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import ShiftPage from "./pages/ShiftPage";
import PlaceholderModulePage from "./pages/PlaceholderModulePage";

const queryClient = new QueryClient();

const App = () => {
  // Check for system dark mode preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/shift" element={<ShiftPage />} />
            <Route path="/dashboard/sell" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/sales" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/stock" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/accounts" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/analytics" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/users" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/settings" element={<PlaceholderModulePage />} />
            <Route path="/dashboard/backoffice" element={<PlaceholderModulePage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
