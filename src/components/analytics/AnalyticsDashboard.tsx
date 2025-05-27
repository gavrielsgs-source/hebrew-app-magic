
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, Users, Car } from "lucide-react";
import { useDateRangeAnalytics } from "@/hooks/analytics/use-date-range-analytics";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";

export function AnalyticsDashboard() {
  const { data: dateRanges } = useDateRangeAnalytics();
  const currentPeriod = dateRanges?.thisMonth || { from: new Date(), to: new Date() };
  const previousPeriod = dateRanges?.lastMonth || { from: new Date(), to: new Date() };

  const { data: currentAnalytics, isLoading: currentLoading, error: currentError } = useAdvancedAnalytics(currentPeriod);
  const { data: previousAnalytics, isLoading: previousLoading, error: previousError } = useAdvancedAnalytics(previousPeriod);

  const isLoading = currentLoading || previousLoading;
  const error = currentError || previousError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>שגיאה בטעינת נתונים</CardTitle>
            <CardDescription>לא ניתן לטעון את נתוני האנליטיקס</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPeriodData = currentAnalytics || {};
  const previousPeriodData = previousAnalytics || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriodData.totalLeads || 0}</div>
            <p className="text-xs text-muted-foreground">
              {previousPeriodData.totalLeads ? 
                `${((((currentPeriodData.totalLeads || 0) - previousPeriodData.totalLeads) / previousPeriodData.totalLeads) * 100).toFixed(1)}%` : 
                '0%'} מהתקופה הקודמת
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">רכבים פעילים</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriodData.totalCars || 0}</div>
            <p className="text-xs text-muted-foreground">
              {previousPeriodData.totalCars ? 
                `${((((currentPeriodData.totalCars || 0) - previousPeriodData.totalCars) / previousPeriodData.totalCars) * 100).toFixed(1)}%` : 
                '0%'} מהתקופה הקודמת
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות שהושלמו</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriodData.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {previousPeriodData.completedTasks ? 
                `${((((currentPeriodData.completedTasks || 0) - previousPeriodData.completedTasks) / previousPeriodData.completedTasks) * 100).toFixed(1)}%` : 
                '0%'} מהתקופה הקודמת
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">שיעור המרה</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriodData.conversionRate || '0%'}</div>
            <p className="text-xs text-muted-foreground">
              מלידים לעסקאות סגורות
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">לידים</TabsTrigger>
          <TabsTrigger value="sales">מכירות</TabsTrigger>
          <TabsTrigger value="conversion">המרות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>מגמת לידים</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="text-center py-8 text-muted-foreground">
                גרף לידים יופיע כאן
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ביצועי מכירות</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="text-center py-8 text-muted-foreground">
                גרף מכירות יופיע כאן
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>שיעורי המרה</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="text-center py-8 text-muted-foreground">
                גרף המרות יופיע כאן
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
