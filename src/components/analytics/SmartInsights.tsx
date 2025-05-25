
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartInsight } from "./ChartInsight";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  generateLeadsBySourceInsight,
  generateConversionInsight,
  generateResponseTimeInsight,
  generateSalesOverTimeInsight
} from "./AnalyticsInsights";

export function SmartInsights({ data }: { data?: any }) {
  const isMobile = useIsMobile();
  
  if (!data) {
    return null;
  }

  const insights = [
    generateConversionInsight(data),
    generateResponseTimeInsight(data),
    generateLeadsBySourceInsight(data),
    generateSalesOverTimeInsight(data)
  ];

  return (
    <Card className={`${isMobile ? 'my-4' : ''} analytics-card`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-lg font-medium flex items-center gap-2">
          📊 תובנות חכמות
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
