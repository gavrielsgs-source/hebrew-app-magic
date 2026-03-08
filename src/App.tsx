import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useIsMobile } from "@/hooks/use-mobile";
import SignupTrial from "./pages/SignupTrial";
import TrialSignup from "./pages/TrialSignup";
import ManageSubscription from "./pages/ManageSubscription";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import WhyChooseUs from "./pages/WhyChooseUs";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Cars from "./pages/Cars";
import Leads from "./pages/Leads";
import Templates from "./pages/Templates";
import Subscription from "./pages/Subscription";
import UpgradeSubscription from "./pages/UpgradeSubscription";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentError from "./pages/PaymentError";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Documents from "./pages/Documents";
import DocumentProduction from "./pages/DocumentProduction";
import DocumentProductionWelcome from "./pages/DocumentProductionWelcome";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import Admin from "./pages/Admin";
import Payment from "./pages/Payment";
import Welcome from "./pages/Welcome";
import AccessManagement from "./pages/Companies";
import CompanySettings from "./pages/CompanySettings";
import CompanyUsers from "./pages/CompanyUsers";
import TeamManagement from "./pages/TeamManagement";
import "./components/ui/mobile-responsive.css";
import { useMemo } from "react";
import AcceptInvitation from "./pages/AcceptInvitation";
import AboutUs from "./pages/AboutUs";
import TaxInvoice from "./pages/TaxInvoice";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import { GracePeriodWarning } from "./components/subscription/GracePeriodWarning";
import { MatchAlertDialog } from "./components/notifications/MatchAlertDialog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Invoices from "./pages/Invoices";
import AccountantReports from "./pages/AccountantReports";
import PublicInventory from "./pages/PublicInventory";
import SharedDocument from "./pages/SharedDocument";
import OpenFormat from "./pages/OpenFormat";

const App = () => {
  // Create QueryClient with useMemo to ensure stability
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }), []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SecurityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <SubscriptionProvider>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/about-us" element={<AboutUs />} />
                    <Route path="/why-choose-us" element={<WhyChooseUs />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth" element={<AuthRoute />} />
                    <Route path="/signup-trial" element={<SignupTrial />} />
                    <Route path="/trial-signup" element={<TrialSignup />} />
                    <Route path="/inventory/:slug" element={<PublicInventory />} />
                    <Route path="/share/document/:shareId" element={<SharedDocument />} />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                    <Route path="/welcome" element={
                      <ProtectedRoute requireSubscriptionCheck={false}>
                        <Welcome />
                      </ProtectedRoute>
                    } />
                    <Route path="/subscription/expired" element={
                      <ProtectedRoute requireSubscriptionCheck={false}>
                        <SubscriptionExpired />
                      </ProtectedRoute>
                    } />
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </SubscriptionProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </SecurityProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

function AppLayout() {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <GracePeriodWarning />
      <div className="flex min-h-screen w-full">
        {!isMobile && <AppSidebar />}
        <SidebarInset className={isMobile ? "mr-0" : ""}>
          <div className={isMobile ? "w-full" : ""}>
            <ErrorBoundary>
              <Routes>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:customerId" element={<CustomerProfile />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/documents" element={<Documents />} />
                {/* Document Production routes */}
                <Route path="/document-production" element={<DocumentProductionWelcome />} />
                <Route path="/document-production/tax-invoice" element={<TaxInvoice />} />
                <Route path="/document-production/:type" element={<DocumentProduction />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscription/manage" element={<ManageSubscription />} />
                <Route path="/subscription/upgrade" element={<UpgradeSubscription />} />
                <Route path="/subscription/payment-success" element={<PaymentSuccess />} />
                <Route path="/subscription/payment-error" element={<PaymentError />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/reports/accountant" element={<AccountantReports />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/companies" element={<AccessManagement />} />
                <Route path="/company/:companyId/settings" element={<CompanySettings />} />
                <Route path="/company/:companyId/users" element={<CompanyUsers />} />
                <Route path="/team-management" element={<TeamManagement />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/open-format" element={<OpenFormat />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </SidebarInset>
        {isMobile && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">טוען...</div>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Auth />;
}

export default App;
