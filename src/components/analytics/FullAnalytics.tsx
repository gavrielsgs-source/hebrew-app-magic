
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, Users, Car } from "lucide-react";
import { useDateRangeAnalytics } from "@/hooks/analytics/use-date-range-analytics";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";
import { SmartInsights } from "./SmartInsights";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

export function FullAnalytics() {
  const { data: dateRanges } = useDateRangeAnalytics();
  const currentPeriod = dateRanges?.thisMonth || { from: new Date(), to: new Date() };
  const previousPeriod = dateRanges?.lastMonth || { from: new Date(), to: new Date() };

  const { data: currentAnalytics, isLoading: currentLoading } = useAdvancedAnalytics(currentPeriod);
  const { data: previousAnalytics, isLoading: previousLoading } = useAdvancedAnalytics(previousPeriod);

  const isLoading = currentLoading || previousLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">לידים חדשים</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPeriodData.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {previousPeriodData.totalLeads ? 
                `${(((currentPeriodData.totalLeads - previousPeriodData.totalLeads) / previousPeriodData.totalLeads) * 100).toFixed(1)}%` : 
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
            <div className="text-2xl font-bold">{currentPeriodData.totalCars}</div>
            <p className="text-xs text-muted-foreground">
              {previousPeriodData.totalCars ? 
                `${(((currentPeriodData.totalCars - previousPeriodData.totalCars) / previousPeriodData.totalCars) * 100).toFixed(1)}%` : 
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
            <div className="text-2xl font-bold">{currentPeriodData.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {previousPeriodData.totalSales ? 
                `${(((currentPeriodData.totalSales - previousPeriodData.totalSales) / previousPeriodData.totalSales) * 100).toFixed(1)}%` : 
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
            <div className="text-2xl font-bold">{currentPeriodData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              מלידים לעסקאות סגורות
            </p>
          </CardContent>
        </Card>
      </div>

      <SmartInsights data={currentPeriodData} />

      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">לידים</TabsTrigger>
          <TabsTrigger value="sales">מכירות</TabsTrigger>
          <TabsTrigger value="sources">מקורות</TabsTrigger>
        </TabsList>
        
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
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
          <Card>
            <CardHeader>
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
                    <Bar dataKey="leads" fill="var(--color-leads)" />
                    <Bar dataKey="sales" fill="var(--color-sales)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
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
                    <Bar dataKey="count" fill="var(--color-count)" />
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
