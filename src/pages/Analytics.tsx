import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { StandardPageHeader } from "@/components/common/StandardPageHeader";
import { BarChart3 } from "lucide-react";
import { useEffect } from "react";

export default function Analytics() {
  // הגדרת כיוון ה-RTL לתמיכה בעברית
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "he";
    
    // Add inline style to fix chart alignment
    const style = document.createElement('style');
    style.innerHTML = `
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
      <StandardPageHeader
        title="אנליטיקה"
        subtitle="נתונים ותובנות עיסקיות מתקדמות"
        icon={BarChart3}
      />
      <AnalyticsDashboard />
    </div>
  );
}
