import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardUsage from "./pages/dashboard/DashboardUsage";
import DashboardBilling from "./pages/dashboard/DashboardBilling";
import DashboardKeys from "./pages/dashboard/DashboardKeys";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Sandbox from "./pages/Sandbox";
import ApiDocs from "./pages/ApiDocs";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/api" element={<ApiDocs />} />
              <Route path="/docs" element={<ApiDocs />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverview />} />
                <Route path="usage" element={<DashboardUsage />} />
                <Route path="billing" element={<DashboardBilling />} />
                <Route path="keys" element={<DashboardKeys />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
