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
import Overview from "./pages/institutional/Overview";
import ApiPageInst from "./pages/institutional/ApiPage";
import BulkValidationPage from "./pages/institutional/BulkValidationPage";
import PricingPage from "./pages/institutional/PricingPage";
import About from "./pages/institutional/About";
import SecurityPage from "./pages/institutional/SecurityPage";
import EnterprisePage from "./pages/institutional/EnterprisePage";
import Contact from "./pages/institutional/Contact";
import PrivacyPolicy from "./pages/institutional/PrivacyPolicy";
import TermsOfService from "./pages/institutional/TermsOfService";

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
            <Route path="/overview" element={<Overview />} />
            <Route path="/api" element={<ApiPageInst />} />
            <Route path="/bulk-validation" element={<BulkValidationPage />} />
            <Route path="/pricing-info" element={<PricingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/enterprise-solutions" element={<EnterprisePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
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
