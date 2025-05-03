
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useEffect } from "react";

export default function Analytics() {
  // הגדרת כיוון ה-RTL לתמיכה בעברית
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
  }, []);
  
  return (
    <div className="container py-4 md:py-6">
      <AnalyticsDashboard />
    </div>
  );
}
