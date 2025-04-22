
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export default function Index() {
  return (
    <div className="p-2 md:p-6" dir="rtl">
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-right">טוען...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
