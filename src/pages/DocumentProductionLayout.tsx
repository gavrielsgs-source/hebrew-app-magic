import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar/components/sidebar-inset";
import DocumentProductionSidebar from "@/components/document-production/DocumentProductionSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DocumentProductionLayout() {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    document.title = "הפקת מסמכים - CarsLead";
  }, []);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-[calc(100vh-64px)] w-full">
        <DocumentProductionSidebar />
        <SidebarInset>
          <header className="hidden md:flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 text-right ml-auto">
              <h1 className="text-lg font-semibold">הפקת מסמכים</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}