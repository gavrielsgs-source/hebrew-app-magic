
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { useEffect } from "react";

export default function Analytics() {
  // הגדרת כיוון ה-RTL לתמיכה בעברית
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
    
    // Add inline style to fix SmartInsights alignment
    const style = document.createElement('style');
    style.innerHTML = `
      .analytics-card .card-description,
      .analytics-card .card-title,
      .analytics-card p {
        text-align: right !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="container py-4 md:py-6">
      <AnalyticsDashboard />
    </div>
  );
}
