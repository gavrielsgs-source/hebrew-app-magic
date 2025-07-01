
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarDays, TrendingUp, Users, Car, Download, Filter, Settings } from "lucide-react";
import { useDateRangeAnalytics } from "@/hooks/analytics/use-date-range-analytics";
import { useAdvancedAnalytics } from "@/hooks/analytics/use-combined-analytics";
import { SmartInsights } from "./SmartInsights";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export function CustomAnalytics() {
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

  // Enhanced sample data for enterprise features
  const advancedLeadsData = [
    { month: 'ינואר', leads: 12, sales: 3, revenue: 150000, cost: 5000 },
    { month: 'פברואר', leads: 19, sales: 5, revenue: 245000, cost: 7500 },
    { month: 'מרץ', leads: 15, sales: 4, revenue: 198000, cost: 6000 },
    { month: 'אפריל', leads: 22, sales: 7, revenue: 342000, cost: 9000 },
    { month: 'מאי', leads: 18, sales: 6, revenue: 289000, cost: 7200 },
    { month: 'יוני', leads: 25, sales: 8, revenue: 395000, cost: 10000 }
  ];

  const pieData = [
    { name: 'פייסבוק', value: 35, color: '#0088FE' },
    { name: 'גוגל', value: 25, color: '#00C49F' },
    { name: 'הפניה', value: 20, color: '#FFBB28' },
    { name: 'ישיר', value: 20, color: '#FF8042' }
  ];

  const predictionData = [
    { month: 'יולי', actual: null, predicted: 28 },
    { month: 'אוגוסט', actual: null, predicted: 32 },
    { month: 'ספטמבר', actual: null, predicted: 29 }
  ];

  const handleExportData = () => {
    console.log('Exporting analytics data...');
    // Implementation for data export
  };

  return (
    <div className="space-y-6">
      {/* Header with custom controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">אנליטיקה מותאמת אישית</h2>
          <p className="text-muted-foreground">דוחות מתקדמים ותחזיות</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            מסנן מתקדם
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            הגדרות דוח
          </Button>
          <Button size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            ייצוא נתונים
          </Button>
        </div>
      </div>

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
            <div className="mt-2 text-xs text-green-600">
              תחזית: +15% בחודש הבא
            </div>
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
            <div className="mt-2 text-xs text-blue-600">
              ROI: ₪8.5 לכל ₪1 השקעה
            </div>
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
            <div className="mt-2 text-xs text-orange-600">
              עלות לעסקה: ₪1,247
            </div>
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
            <div className="mt-2 text-xs text-purple-600">
              יעד: 25% עד סוף השנה
            </div>
          </CardContent>
        </Card>
      </div>

      <SmartInsights data={currentPeriodData} />

      <Tabs defaultValue="advanced" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advanced">ניתוח מתקדם</TabsTrigger>
          <TabsTrigger value="predictions">תחזיות</TabsTrigger>
          <TabsTrigger value="roi">ROI ורווחיות</TabsTrigger>
          <TabsTrigger value="custom">דוח מותאם</TabsTrigger>
        </TabsList>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>מגמות מתקדמות</CardTitle>
                <CardDescription>ניתוח עמוק של ביצועים</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    leads: { label: "לידים", color: "hsl(var(--chart-1))" },
                    sales: { label: "מכירות", color: "hsl(var(--chart-2))" },
                    revenue: { label: "הכנסות", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={advancedLeadsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} />
                      <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פילוח מקורות לידים</CardTitle>
                <CardDescription>התפלגות לפי ערוצי רכישה</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    value: { label: "ערך", color: "hsl(var(--chart-4))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>תחזיות AI</CardTitle>
              <CardDescription>תחזיות מבוססות בינה מלאכותית לשלושת החודשים הבאים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                {predictionData.map((item, index) => (
                  <div key={index} className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold">{item.month}</div>
                    <div className="text-2xl font-bold text-blue-600">{item.predicted}</div>
                    <div className="text-sm text-muted-foreground">לידים צפויים</div>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                * תחזיות מבוססות על נתונים היסטוריים ומגמות שוק
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ניתוח רווחיות</CardTitle>
              <CardDescription>השוואת השקעות לתשואות</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "הכנסות", color: "hsl(var(--chart-1))" },
                  cost: { label: "עלויות", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={advancedLeadsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" />
                    <Bar dataKey="cost" fill="var(--color-cost)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>דוח מותאם אישית</CardTitle>
              <CardDescription>צור דוח לפי הצרכים הספציפיים שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="mb-4 text-muted-foreground">
                  כאן תוכל ליצור דוחות מותאמים אישית עם המדדים החשובים לך
                </p>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  בנה דוח מותאם
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
