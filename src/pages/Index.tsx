
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Index() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen text-right">
            <div className="text-center">
              <div className="text-lg font-medium">טוען...</div>
            </div>
          </div>
        }>
          <MobileDashboard />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="w-full" dir="rtl">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-right">טוען...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
