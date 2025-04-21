
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { AuthProvider } from "@/contexts/auth-context";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import Cars from "./pages/Cars";
import Leads from "./pages/Leads";
import Templates from "./pages/Templates";
import Subscription from "./pages/Subscription";
import UpgradeSubscription from "./pages/UpgradeSubscription";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/use-auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider defaultOpen={true}>
            <Routes>
              <Route path="/auth" element={<AuthRoute />} />
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <SubscriptionProvider>
                      <AuthProvider>
                        <div className="flex min-h-screen w-full">
                          <AppSidebar />
                          <main className="flex-1 mx-auto max-w-6xl overflow-auto p-4 transition-all duration-300">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/tasks" element={<Tasks />} />
                              <Route path="/cars" element={<Cars />} />
                              <Route path="/leads" element={<Leads />} />
                              <Route path="/templates" element={<Templates />} />
                              <Route path="/subscription" element={<Subscription />} />
                              <Route path="/subscription/upgrade" element={<UpgradeSubscription />} />
                              <Route path="/admin" element={<Admin />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </AuthProvider>
                    </SubscriptionProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

function AuthRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">טוען...</div>;
  
  if (user) return <Navigate to="/" replace />;
  
  return <Auth />;
}

export default App;
