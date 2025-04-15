
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 rtl" dir="rtl">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">טוען...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
