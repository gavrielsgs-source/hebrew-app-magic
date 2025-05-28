
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { AuthProvider } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import Admin from "./pages/Admin";
import { Component, ErrorInfo, ReactNode } from "react";

// Create QueryClient with error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.log(`Query failed ${failureCount} times:`, error);
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Enhanced Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode; fallbackComponent?: ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: { children: ReactNode; fallbackComponent?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-red-600 mb-4">אירעה שגיאה בטעינת הדף</h2>
            <p className="text-gray-600 mb-6">
              אירעה שגיאה לא צפויה באפליקציה. אנא רענן את הדף או חזור לעמוד הבית.
            </p>
            <div className="space-y-2 mb-6 text-sm text-gray-500">
              <p>שגיאה: {this.state.error?.message || 'שגיאה לא מוכרת'}</p>
              {this.state.errorInfo && (
                <details className="text-xs">
                  <summary>פרטים טכניים</summary>
                  <pre className="mt-2 text-left overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                רענן דף
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                חזור לעמוד הבית
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  console.log('🚀 App component starting to render...');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<AuthRoute />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SubscriptionProvider>
                      <AuthProvider>
                        <AppLayout />
                      </AuthProvider>
                    </SubscriptionProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

function AppLayout() {
  const isMobile = useIsMobile();
  console.log('📱 AppLayout rendering, isMobile:', isMobile);

  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <ErrorBoundary fallbackComponent={
              <div className="p-4 text-center" dir="rtl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-red-800 mb-2">שגיאה בטעינת הדף</h2>
                  <p className="text-red-600 mb-4">אירעה שגיאה בטעינת התוכן</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      רענן דף
                    </button>
                    <button 
                      onClick={() => window.location.href = '/'} 
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      חזור לעמוד הבית
                    </button>
                  </div>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/cars" element={<Cars />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/subscription/upgrade" element={<UpgradeSubscription />} />
                <Route path="/subscription/payment-success" element={<PaymentSuccess />} />
                <Route path="/subscription/payment-error" element={<PaymentError />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </SidebarInset>
          {isMobile && <MobileBottomNav />}
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  console.log('🔐 AuthRoute rendering, user:', !!user, 'loading:', loading);
  
  if (loading) {
    console.log('⏳ AuthRoute showing loading state');
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
    console.log('✅ AuthRoute redirecting authenticated user to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('🔑 AuthRoute showing auth component');
  return <Auth />;
}

export default App;
