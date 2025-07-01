
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Car, CheckCircle } from "lucide-react";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";
import { useDateRangeAnalytics } from "@/hooks/analytics/use-date-range-analytics";

export function BasicAnalytics() {
  const { data: dateRanges } = useDateRangeAnalytics();
  const currentPeriod = dateRanges?.thisMonth || { from: new Date(), to: new Date() };
  const { data: analytics, isLoading } = useAdvancedAnalytics(currentPeriod);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">טוען...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const currentData = analytics || {
    totalLeads: 0,
    totalCars: 0,
    totalSales: 0,
    conversionRate: 0
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalLeads}</div>
            <p className="text-xs text-muted-foreground">החודש הנוכחי</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">רכבים פעילים</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalCars}</div>
            <p className="text-xs text-muted-foreground">במלאי</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">עסקאות</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.totalSales}</div>
            <p className="text-xs text-muted-foreground">החודש הנוכחי</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שיעור המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">מלידים לעסקאות</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>אנליטיקה בסיסית</CardTitle>
          <CardDescription>
            תכונות נוספות זמינות בחבילות מתקדמות יותר
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">חבילת הפרימיום כוללת נתונים בסיסיים</p>
            <p className="text-sm">לגרפים מתקדמים ותובנות חכמות - שדרג לחבילת ביזנס</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
