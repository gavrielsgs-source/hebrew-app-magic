
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface InsightProps {
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "danger";
  improvement?: string;
  icon?: React.ReactNode;
}

function Insight({ title, description, type, improvement, icon }: InsightProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "info":
        return {
          bgColor: "bg-blue-50",
          textColor: "text-blue-700",
          icon: icon || <Info className="h-4 w-4" />
        };
      case "success":
        return {
          bgColor: "bg-green-50",
          textColor: "text-green-700",
          icon: icon || <TrendingUp className="h-4 w-4" />
        };
      case "warning":
        return {
          bgColor: "bg-amber-50",
          textColor: "text-amber-700",
          icon: icon || <AlertCircle className="h-4 w-4" />
        };
      case "danger":
        return {
          bgColor: "bg-rose-50",
          textColor: "text-rose-700",
          icon: icon || <TrendingDown className="h-4 w-4" />
        };
      default:
        return {
          bgColor: "bg-slate-50",
          textColor: "text-slate-700",
          icon: icon || <Info className="h-4 w-4" />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Alert variant="outline" className={`${styles.bgColor} border`}>
      <div className="flex gap-3 items-start">
        <div className={`mt-0.5 ${styles.textColor}`}>{styles.icon}</div>
        <div>
          <AlertTitle className="mb-1 text-right font-bold text-gray-900">{title}</AlertTitle>
          <AlertDescription className="text-right text-sm">{description}</AlertDescription>
          {improvement && (
            <div className="mt-2 text-sm">
              <Badge variant="outline" className="font-normal">המלצה</Badge>
              <span className="mr-2">{improvement}</span>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

export function SmartInsights({ data }: { data?: any }) {
  const isMobile = useIsMobile();
  
  if (!data) {
    return null;
  }
  
  // חישוב תובנות מנתוני האנליטיקה
  const insights = [
    {
      title: "זמן תגובה גבוה מהממוצע",
      description: `זמן התגובה הממוצע ללידים הוא ${data.avgResponseTime} דקות, גבוה מהיעד של 60 דקות`,
      type: "warning" as const,
      improvement: "הגדר התראות מיידיות על לידים חדשים"
    },
    {
      title: "מקור הלידים המוביל",
      description: data.leadsBySource && data.leadsBySource[0] ? 
        `"${data.leadsBySource[0].source}" הוא מקור הלידים המוביל עם ${data.leadsBySource[0].count} לידים` : 
        "אין מספיק נתונים",
      type: "info" as const
    },
    {
      title: data.conversionRate > 15 ? "שיעור המרה טוב" : "שיעור המרה נמוך",
      description: `שיעור ההמרה הנוכחי הוא ${data.conversionRate.toFixed(1)}%`,
      type: data.conversionRate > 15 ? "success" as const : "danger" as const,
      improvement: data.conversionRate <= 15 ? "שקול לשפר את תהליך המעקב אחרי לידים" : undefined
    }
  ];

  // הוספת תובנות נוספות רק אם יש נתונים מספקים
  if (data.salesByAgent && data.salesByAgent.length > 0) {
    const topAgent = data.salesByAgent.reduce((a: any, b: any) => a.sales > b.sales ? a : b, {});
    if (topAgent.sales > 0) {
      insights.push({
        title: "סוכן המכירות המוביל",
        description: `${topAgent.agent} עם ${topAgent.sales} מכירות בתקופה הנבחרת`,
        type: "success" as const
      });
    }
  }

  // מצא את הרכב הפופולרי ביותר (דוגמה מלאכותית)
  insights.push({
    title: "דגם הרכב המבוקש ביותר",
    description: "יונדאי טוסון עם 8 מכירות בתקופה הנבחרת",
    type: "info" as const,
    improvement: "רכוש מלאי נוסף מדגם זה"
  });

  return (
    <Card className={`${isMobile ? 'my-4' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-lg font-medium">תובנות חכמות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <div key={i}>
              <Insight {...insight} />
              {i < insights.length - 1 && <div className="h-2" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
