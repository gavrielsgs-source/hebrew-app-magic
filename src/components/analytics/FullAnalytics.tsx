
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Car, CheckCircle } from "lucide-react";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";
import { SmartInsights } from "./SmartInsights";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

export function FullAnalytics() {
  // ברירת מחדל: 30 הימים האחרונים + 30 הימים שלפניהם
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 30);
  const prevTo = new Date(from);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevTo.getDate() - 30);

  const currentPeriod = { from, to: now };
  const previousPeriod = { from: prevFrom, to: prevTo };

  const { data: currentAnalytics, isLoading: currentLoading } = useAdvancedAnalytics(currentPeriod);
  const { data: previousAnalytics, isLoading: previousLoading } = useAdvancedAnalytics(previousPeriod);

  const isLoading = currentLoading || previousLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl shadow-sm">
              <CardHeader className="flex flex-row items-center justify-end space-y-0 pb-2">
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

  const defaultAnalytics = {
    totalLeads: 0,
    totalCars: 0,
    totalSales: 0,
    conversionRate: 0,
    leadsBySource: [],
    leadsOverTime: [],
    salesOverTime: []
  };

  const currentPeriodData = currentAnalytics || defaultAnalytics;
  const previousPeriodData = previousAnalytics || defaultAnalytics;

  // שימוש בנתונים אמיתיים מהדאטהבייס
  const leadsData = currentPeriodData.leadsOverTime.map(item => {
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleDateString('he-IL', { month: 'long' });
    return {
      month: monthName,
      leads: item.leads,
      sales: item.sales
    };
  });

  const sourceData = currentPeriodData.leadsBySource;

  // חישוב אחוזי שינוי
  const getChangePercent = (current: number, previous: number) => {
    if (!previous) return '0%';
    const change = ((current - previous) / previous * 100).toFixed(1);
    return `${change}%`;
  };

  return (
    <div className="space-y-6">
      {/* כותרת - בצד ימין */}
      <div className="flex justify-start">
        <div className="text-right">
          <h2 className="text-xl font-bold">ניתוח מתקדם</h2>
          <p className="text-sm text-muted-foreground">30 הימים האחרונים</p>
        </div>
      </div>

      {/* כרטיסי מדדים */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentPeriodData.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {getChangePercent(currentPeriodData.totalLeads, previousPeriodData.totalLeads)} מהתקופה הקודמת
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">רכבים פעילים</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentPeriodData.totalCars}</div>
            <p className="text-xs text-muted-foreground">
              {getChangePercent(currentPeriodData.totalCars, previousPeriodData.totalCars)} מהתקופה הקודמת
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">עסקאות שנסגרו</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentPeriodData.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {getChangePercent(currentPeriodData.totalSales, previousPeriodData.totalSales)} מהתקופה הקודמת
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex items-center justify-between space-y-0 pb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">שיעור המרה</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{currentPeriodData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              מלידים לעסקאות סגורות
            </p>
          </CardContent>
        </Card>
      </div>

      <SmartInsights />

      <Tabs defaultValue="leads" className="space-y-4">
        <div className="flex justify-end">
          <TabsList className="rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="sources" className="rounded-lg">מקורות</TabsTrigger>
            <TabsTrigger value="sales" className="rounded-lg">מכירות</TabsTrigger>
            <TabsTrigger value="leads" className="rounded-lg">לידים</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="leads" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-right">
              <CardTitle>מגמת לידים לאורך זמן</CardTitle>
              <CardDescription>התפתחות הלידים בחודשים האחרונים</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  leads: {
                    label: "לידים",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leadsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="var(--color-leads)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-right">
              <CardTitle>ביצועי מכירות</CardTitle>
              <CardDescription>השוואה בין לידים למכירות</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  leads: {
                    label: "לידים",
                    color: "hsl(var(--chart-1))",
                  },
                  sales: {
                    label: "מכירות",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="leads" fill="var(--color-leads)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="text-right">
              <CardTitle>מקורות לידים</CardTitle>
              <CardDescription>פילוח לידים לפי מקור</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  count: {
                    label: "כמות",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
