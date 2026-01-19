
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Car, CheckCircle } from "lucide-react";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";

export function BasicAnalytics() {
  // הצגת 30 הימים האחרונים במקום רק החודש הנוכחי
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const currentPeriod = { from: thirtyDaysAgo, to: now };
  const { data: analytics, isLoading } = useAdvancedAnalytics(currentPeriod);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* כותרת */}
        <div className="flex justify-end">
          <div className="text-right">
            <h2 className="text-xl font-bold">ניתוח בסיסי</h2>
            <p className="text-sm text-muted-foreground">30 הימים האחרונים</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-right">טוען...</CardTitle>
              </CardHeader>
              <CardContent className="text-right">
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
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
      {/* כותרת */}
      <div className="flex justify-end">
        <div className="text-right">
          <h2 className="text-xl font-bold">ניתוח בסיסי</h2>
          <p className="text-sm text-muted-foreground">30 הימים האחרונים</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">לידים חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentData.totalLeads}</div>
            <p className="text-xs text-muted-foreground">30 הימים האחרונים</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">רכבים פעילים</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentData.totalCars}</div>
            <p className="text-xs text-muted-foreground">במלאי</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">עסקאות</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentData.totalSales}</div>
            <p className="text-xs text-muted-foreground">30 הימים האחרונים</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row-reverse items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-right">שיעור המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">מלידים לעסקאות</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="text-right">
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
