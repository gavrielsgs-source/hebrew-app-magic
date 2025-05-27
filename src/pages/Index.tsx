
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen text-right">
            <div className="text-center">
              <div className="text-lg font-medium">טוען...</div>
            </div>
          </div>
        }>
          <MobileDashboard />
        </Suspense>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="w-full" dir="rtl">
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-right">טוען...</div>}>
              <Dashboard />
            </Suspense>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
