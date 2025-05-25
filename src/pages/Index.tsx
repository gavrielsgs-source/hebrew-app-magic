
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default function Index() {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="p-2 md:p-6" dir="rtl">
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-right">טוען...</div>}>
              <Dashboard />
            </Suspense>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
