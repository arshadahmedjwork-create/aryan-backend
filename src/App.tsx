import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import { initEmailJS } from "@/lib/email-service";
import LoginPage from "./pages/LoginPage";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerProducts from "./pages/owner/OwnerProducts";
import OwnerOrders from "./pages/owner/OwnerOrders";
import OwnerAnalytics from "./pages/owner/OwnerAnalytics";
import OwnerNps from "./pages/owner/OwnerNps";
import OwnerAlerts from "./pages/owner/OwnerAlerts";
import CustomerProducts from "./pages/customer/CustomerProducts";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerChat from "./pages/customer/CustomerChat";
import CustomerNps from "./pages/customer/CustomerNps";
import OpsDashboard from "./pages/operations/OpsDashboard";
import OpsDeliveries from "./pages/operations/OpsDeliveries";
import OpsAlerts from "./pages/operations/OpsAlerts";
import NotFound from "./pages/NotFound";

// Initialise EmailJS at module load time
initEmailJS();

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  if (!user) return <LoginPage />;

  const homeRoute = user.role === 'owner' ? '/owner/dashboard'
    : user.role === 'operations_manager' ? '/operations/dashboard'
    : '/customer/products';

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to={homeRoute} replace />} />
        {/* Owner */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/products" element={<OwnerProducts />} />
        <Route path="/owner/orders" element={<OwnerOrders />} />
        <Route path="/owner/analytics" element={<OwnerAnalytics />} />
        <Route path="/owner/nps" element={<OwnerNps />} />
        <Route path="/owner/alerts" element={<OwnerAlerts />} />
        {/* Customer */}
        <Route path="/customer/products" element={<CustomerProducts />} />
        <Route path="/customer/orders" element={<CustomerOrders />} />
        <Route path="/customer/chat" element={<CustomerChat />} />
        <Route path="/customer/nps" element={<CustomerNps />} />
        {/* Operations */}
        <Route path="/operations/dashboard" element={<OpsDashboard />} />
        <Route path="/operations/deliveries" element={<OpsDeliveries />} />
        <Route path="/operations/alerts" element={<OpsAlerts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
