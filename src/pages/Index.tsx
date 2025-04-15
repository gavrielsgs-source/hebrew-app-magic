
import { Suspense } from "react";
import { Link } from "react-router-dom";
import Dashboard from "@/components/Dashboard";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 rtl" dir="rtl">
      <div className="container mx-auto py-8">
        <div className="flex justify-end mb-8">
          <Link to="/auth">
            <Button>התחברות</Button>
          </Link>
        </div>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">טוען...</div>}>
          <Dashboard />
        </Suspense>
      </div>
    </div>
  );
}
