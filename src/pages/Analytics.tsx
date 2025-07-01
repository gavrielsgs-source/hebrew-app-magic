
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
      .analytics-card p,
      .analytics-card div {
        text-align: right !important;
      }
      
      [dir="rtl"] .recharts-wrapper .recharts-cartesian-axis-ticks text {
        text-anchor: end;
      }
      
      [dir="rtl"] .recharts-legend-item {
        margin-right: 0;
        margin-left: 10px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="container py-4 md:py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-right">אנליטיקה</h1>
        <p className="text-muted-foreground text-right mt-2">
          נתונים ותובנות עיסקיות מתקדמות
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
