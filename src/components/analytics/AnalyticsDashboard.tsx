import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAdvancedAnalytics, useDateRangeAnalytics } from "@/hooks/use-advanced-analytics";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { SmartInsights } from "./SmartInsights";
import { EnhancedChart } from "./EnhancedChart";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  generateLeadsBySourceInsight,
  generateConversionInsight,
  generateResponseTimeInsight,
  generateSalesOverTimeInsight
} from "./AnalyticsInsights";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6385'];

export function AnalyticsDashboard() {
  const { data: dateRanges, isLoading: isDateRangesLoading } = useDateRangeAnalytics();
  const [selectedRange, setSelectedRange] = useState<string>("thisMonth");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const isMobile = useIsMobile();
  
  const dateRange = dateRanges && selectedRange ? dateRanges[selectedRange as keyof typeof dateRanges] : { from: new Date(), to: new Date() };
  
  const { data, isLoading } = useAdvancedAnalytics(dateRange);
  
  // פונקציית עזר לפורמט מספרים
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('he-IL').format(num);
  };
  
  // פונקציית עזר לפורמט אחוזים
  const formatPercent = (num: number) => {
    return `${num.toFixed(1)}%`;
  };
  
  // פונקציית עזר לפורמט כסף
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(num);
  };

  if (isLoading || isDateRangesLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg font-medium">טוען נתוני אנליטיקה...</div>
          <div className="mt-2 text-sm text-muted-foreground">אנא המתן בזמן שאנחנו מעבדים את הנתונים</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">📈 אנליטיקה ומדדי ביצוע</h2>
          <p className="text-muted-foreground">ניתוח מעמיק של ביצועי המערכת ונתוני המכירות</p>
        </div>
        
        <div className="w-full md:w-auto">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="בחר טווח זמן" />
            </SelectTrigger>
            <SelectContent>
              {dateRanges && Object.entries(dateRanges).map(([key, range]) => (
                <SelectItem key={key} value={key}>{range.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* תובנות חכמות */}
      <SmartInsights data={data} />
      
      {/* מדדים עיקריים */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">סה"כ לידים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalLeads)}</div>
            <p className="text-xs text-muted-foreground">בטווח הזמן הנבחר</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">עסקאות שהושלמו</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalSales)}</div>
            <div className="flex items-center text-xs">
              <Badge variant={data.conversionRate > 15 ? "default" : "destructive"} className="ml-1">
                {data.conversionRate > 15 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                {formatPercent(data.conversionRate)}
              </Badge>
              <span className="text-muted-foreground">שיעור המרה</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">זמן תגובה ממוצע</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgResponseTime < 60 
                ? `${data.avgResponseTime} דקות` 
                : `${(data.avgResponseTime / 60).toFixed(1)} שעות`}
            </div>
            <p className="text-xs text-muted-foreground">מרגע יצירת הליד</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">רכבים במלאי</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalCars)}</div>
            <p className="text-xs text-muted-foreground">שיוכלו להימכר</p>
          </CardContent>
        </Card>
      </div>
      
      {/* טאבים לתצוגות שונות */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`grid ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'} gap-1`}>
          <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
          <TabsTrigger value="leads">ניתוח לידים</TabsTrigger>
          <TabsTrigger value="sales">ביצועי מכירות</TabsTrigger>
          <TabsTrigger value="agents">ביצועי סוכנים</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            <EnhancedChart
              title="📊 לידים לפי מקור"
              description="התפלגות מקורות הלידים בטווח הזמן שנבחר"
              insight={generateLeadsBySourceInsight(data)}
              className="md:col-span-1"
            >
              <div className={isMobile ? "h-64" : "h-80"}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.leadsBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 60 : 80}
                      label={({ source, count, percent }: any) => 
                        isMobile ? `${(percent * 100).toFixed(0)}%` : 
                        `${source}: ${(percent * 100).toFixed(0)}%`
                      }
                      dataKey="count"
                      nameKey="source"
                    >
                      {data.leadsBySource.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: string, props: any) => [`${value} לידים`, props.payload.source]} 
                    />
                    <Legend 
                      layout={isMobile ? "horizontal" : "vertical"}
                      verticalAlign={isMobile ? "bottom" : "middle"}
                      align={isMobile ? "center" : "right"}
                      wrapperStyle={isMobile ? {} : { right: 0 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </EnhancedChart>
            
            <EnhancedChart
              title="📈 שיעורי המרה לפי מקור"
              description="אחוז הלידים שהבשילו לעסקאות לפי מקור"
              insight={generateConversionInsight(data)}
              className="md:col-span-1"
            >
              <div className={isMobile ? "h-64" : "h-80"}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={data.conversionBySource}
                    layout={isMobile ? "vertical" : "horizontal"}
                    margin={isMobile ? { top: 5, right: 30, left: 20, bottom: 5 } : undefined}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    {isMobile ? (
                      <>
                        <YAxis dataKey="source" type="category" width={70} tick={{ fontSize: 12 }} />
                        <XAxis type="number" tickFormatter={(value: number) => `${value}%`} />
                      </>
                    ) : (
                      <>
                        <XAxis dataKey="source" />
                        <YAxis tickFormatter={(value: number) => `${value}%`} />
                      </>
                    )}
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'שיעור המרה']} />
                    <Bar dataKey="rate" name="שיעור המרה" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </EnhancedChart>
          </div>

          <EnhancedChart
            title="📈 מגמת לידים לאורך זמן"
            description="כמות הלידים החדשים לפי תאריך"
            insight={generateSalesOverTimeInsight(data)}
          >
            <div className={isMobile ? "h-64" : "h-80"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.leadsOverTime} 
                  margin={isMobile ? { top: 5, right: 10, left: 0, bottom: 20 } : undefined}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} לידים`, 'כמות']} />
                  <Bar dataKey="count" name="לידים" fill="#33C3F0" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EnhancedChart>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          {/* תכני ניתוח לידים */}
          <Card>
            <CardHeader>
              <CardTitle>⏱️ זמני תגובה ללידים</CardTitle>
              <CardDescription>זמן ממוצע לתגובה ראשונה ללידים</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-4`}>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">תגובה בשעה הראשונה</div>
                    <div className="text-2xl font-bold mt-2">67%</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">תגובה ביום הראשון</div>
                    <div className="text-2xl font-bold mt-2">89%</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm font-medium text-muted-foreground">ללא תגובה</div>
                    <div className="text-2xl font-bold mt-2">4%</div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-sm">
                  <h4 className="font-medium">💡 טיפים לשיפור:</h4>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                    <li>שיעור התגובה בתוך שעה נמוך מהיעד (75%)</li>
                    <li>לידים ממקור "פייסבוק" מקבלים תגובה מהירה יותר</li>
                    <li>סוכן "יוסי כהן" הוא המהיר ביותר בתגובה</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📝 ביצועי תבניות</CardTitle>
              <CardDescription>ניתוח אפקטיביות של תבניות ההודעות</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "overflow-x-auto" : ""}>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="text-xs uppercase border-b">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right">שם התבנית</th>
                      <th scope="col" className="px-6 py-3 text-right">נשלחו</th>
                      <th scope="col" className="px-6 py-3 text-right">שיעור תגובה</th>
                      <th scope="col" className="px-6 py-3 text-right">שיעור המרה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.templatePerformance.map((template, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-6 py-4 font-medium text-right">{template.template}</td>
                        <td className="px-6 py-4 text-right">{template.sent}</td>
                        <td className="px-6 py-4 text-right">{template.responseRate}%</td>
                        <td className="px-6 py-4 text-right">
                          {template.responseRate > 60 ? (
                            <Badge className="bg-green-500">גבוה</Badge>
                          ) : template.responseRate > 40 ? (
                            <Badge className="bg-yellow-500">בינוני</Badge>
                          ) : (
                            <Badge className="bg-red-500">נמוך</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-4">
          {/* תכני ביצועי מכירות */}
          <Card>
            <CardHeader>
              <CardTitle>💰 מכירות לאורך זמן</CardTitle>
              <CardDescription>כמות והיקף המכירות על פני זמן</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-64" : "h-80"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.salesOverTime}
                  margin={isMobile ? { top: 5, right: 10, left: 0, bottom: 20 } : undefined}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value, name) => {
                    if (name === 'מכירות') return [value, name];
                    return [formatCurrency(value as number), name];
                  }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" name="מכירות" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="amount" name="סכום" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
            <Card>
              <CardHeader>
                <CardTitle>🚗 רכבים פופולריים</CardTitle>
                <CardDescription>הרכבים הנמכרים ביותר</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">יונדאי טוסון</div>
                      <div className="text-sm text-muted-foreground">8 מכירות</div>
                    </div>
                    <div className="text-green-600 font-medium">🏆 מבוקש ביותר</div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">קיא ספורטאז'</div>
                      <div className="text-sm text-muted-foreground">6 מכירות</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">טויוטה קורולה</div>
                      <div className="text-sm text-muted-foreground">5 מכירות</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>⏰ זמן מכירה ממוצע</CardTitle>
                <CardDescription>זמן ממוצע מיצירת ליד ועד סגירת העסקה</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-sm font-medium text-muted-foreground">זמן ממוצע לסגירה</div>
                      <div className="text-2xl font-bold mt-2">📅 14 ימים</div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">לפי סוג רכב:</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>🚗 רכב פרטי</span>
                          <span className="font-medium">12 ימים</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>🚙 רכבי שטח/SUV</span>
                          <span className="font-medium">16 ימים</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>🚐 רכב מסחרי</span>
                          <span className="font-medium">21 ימים</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4">
          {/* תכני ביצועי סוכנים */}
          <Card>
            <CardHeader>
              <CardTitle>👥 ביצועי סוכנים</CardTitle>
              <CardDescription>השוואת ביצועי סוכני המכירות</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-96" : "h-80"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={data.salesByAgent} 
                  layout="vertical"
                  margin={isMobile ? { top: 5, right: 0, left: 0, bottom: 5 } : undefined}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="agent" 
                    width={isMobile ? 100 : 150}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip formatter={(value) => [value, 'מכירות']} />
                  <Legend />
                  <Bar dataKey="sales" name="מכירות" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">⚡ זמן תגובה מהיר ביותר</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">אורית לוי</div>
                <p className="text-xs text-muted-foreground">45 דקות בממוצע</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">🎯 שיעור המרה גבוה ביותר</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">דוד כהן</div>
                <p className="text-xs text-muted-foreground">38% מלידים לעסקאות</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">💰 סכום מכירות גבוה ביותר</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">יוסי לוי</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(2450000)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
