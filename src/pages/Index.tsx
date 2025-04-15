
import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export default function Index() {
  return (
    <div className="p-6">
      <Suspense fallback={<div className="flex items-center justify-center h-screen">טוען...</div>}>
        <Dashboard />
      </Suspense>
    </div>
  );
}
