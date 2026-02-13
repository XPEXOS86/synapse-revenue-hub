import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BrainDetail from "./pages/BrainDetail";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardUsage from "./pages/dashboard/DashboardUsage";
import DashboardBilling from "./pages/dashboard/DashboardBilling";
import DashboardKeys from "./pages/dashboard/DashboardKeys";
import DashboardAgents from "./pages/dashboard/DashboardAgents";
import NotFound from "./pages/NotFound";
import ApiDocs from "./pages/ApiDocs";
import EnterpriseSales from "./pages/EnterpriseSales";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/brain/:brainId" element={<BrainDetail />} />
            <Route path="/docs" element={<ApiDocs />} />
            <Route path="/enterprise" element={<EnterpriseSales />} />
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
              <Route path="agents" element={<DashboardAgents />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
