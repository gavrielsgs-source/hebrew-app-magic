
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartInsight } from "./ChartInsight";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  generateLeadsBySourceInsight,
  generateConversionInsight,
  generateResponseTimeInsight,
  generateSalesOverTimeInsight
} from "./AnalyticsInsights";

export function SmartInsights() {
  const isMobile = useIsMobile();
  
  // שימוש בנתונים אמיתיים מהמערכת
  const dateRange = {
    from: new Date(new Date().getFullYear(), 0, 1), // תחילת השנה
    to: new Date()
  };
  
  const { data, isLoading } = useAdvancedAnalytics(dateRange);
  
  if (isLoading) {
    return (
      <Card className={`${isMobile ? 'my-4' : ''} rounded-2xl shadow-sm`}>
        <CardHeader className="pb-3 text-right">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span>📊</span>
            תובנות חכמות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card className={`${isMobile ? 'my-4' : ''} rounded-2xl shadow-sm`}>
        <CardHeader className="pb-3 text-right">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span>📊</span>
            תובנות חכמות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            אין מספיק נתונים להצגת תובנות - התחל להזין לידים ורכבים
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = [
    generateConversionInsight(data),
    generateResponseTimeInsight(data),
    generateLeadsBySourceInsight(data),
    generateSalesOverTimeInsight(data)
  ];

  return (
    <Card className={`${isMobile ? 'my-4' : ''} rounded-2xl shadow-sm`}>
      <CardHeader className="pb-3 text-right">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
            <span>📊</span>
            תובנות חכמות
          </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <ChartInsight key={i} {...insight} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
