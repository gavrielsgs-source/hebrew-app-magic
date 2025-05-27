
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Calendar, TrendingUp, Eye, Clock, Users, Car, CheckSquare, BarChart3, Activity } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { MiniCalendar } from "@/components/calendar/MiniCalendar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { data: salesData } = useSalesAnalytics();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();
  const navigate = useNavigate();
  
  const handleActionClick = (route: string) => {
    navigate(route);
  };
  
  if (isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Activity className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="text-lg font-semibold text-gray-900 mb-2">טוען נתוני דשבורד...</div>
          <div className="text-sm text-gray-600">אנא המתן</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
        <AppHeader />

        {/* Hero Section */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            סיכום מהיר
          </h1>
          <p className="text-gray-600">
            המבט הכולל של העסק שלך במקום אחד
          </p>
        </div>

        {/* Stats Grid - Clean Design */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white border border-red-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">דורש טיפול</h3>
                  <p className="text-3xl font-bold text-red-600">{dashboardData?.untreatedLeads?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">לידים שלא טופלו מעל 24 שעות</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">משימות היום</h3>
                  <p className="text-3xl font-bold text-yellow-600">{dashboardData?.todayTasks?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">משימות מתוכננות להיום</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">רכבים במלאי</h3>
                  <p className="text-3xl font-bold text-green-600">{dashboardData?.totalCarsCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">זמינים למכירה</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">סה"כ לידים</h3>
                  <p className="text-3xl font-bold text-blue-600">{dashboardData?.totalLeadsCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">לקוחות פוטנציאליים</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">מה צריך לטפל עכשיו?</h2>
            <p className="text-gray-600">משימות חשובות שדורשות תשומת לב מיידית</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {/* Urgent Leads Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                (dashboardData?.untreatedLeads?.length || 0) > 0 
                  ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleActionClick('/leads')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">לידים שלא טופלו</h3>
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {dashboardData?.untreatedLeads?.length || 0} לידים מחכים למענה מעל 24 שעות
                </p>
                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick('/leads');
                    }}
                  >
                    טפל עכשיו
                  </Button>
                  <span className="text-2xl font-bold text-red-600">
                    {dashboardData?.untreatedLeads?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pending Cars Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                (dashboardData?.pendingCars?.length || 0) > 0 
                  ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleActionClick('/cars')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">רכבים לפרסום</h3>
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Car className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {dashboardData?.pendingCars?.length || 0} רכבים מוכנים לפרסום
                </p>
                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick('/cars');
                    }}
                  >
                    פרסם רכבים
                  </Button>
                  <span className="text-2xl font-bold text-orange-600">
                    {dashboardData?.pendingCars?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Today Tasks Card */}
            <Card 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                (dashboardData?.todayTasks?.length || 0) > 0 
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => handleActionClick('/tasks')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">משימות היום</h3>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CheckSquare className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {dashboardData?.todayTasks?.length || 0} משימות מתוכננות להיום
                </p>
                <div className="flex items-center justify-between">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick('/tasks');
                    }}
                  >
                    צפה במשימות
                  </Button>
                  <span className="text-2xl font-bold text-blue-600">
                    {dashboardData?.todayTasks?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">יומן משימות</h2>
            <p className="text-gray-600">מבט כולל על כל המשימות והפגישות שלך</p>
          </div>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <MiniCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        {dashboardData?.todayTasks && dashboardData.todayTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">משימות להיום</h2>
            
            <div className="grid gap-4">
              {dashboardData.todayTasks.map((task) => (
                <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-right flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-gray-600 text-sm">
                          {task.type === "meeting" ? "פגישה" : "משימה"} • 
                          {new Date(task.due_date).toLocaleTimeString('he-IL', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/tasks")}
                        className="mr-4"
                      >
                        פתח
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 text-right flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ניתוח מכירות
              </CardTitle>
              <CardDescription className="text-right">ביצועים חודשיים ומגמות</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesAnalytics />
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 text-right flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                משימות פעילות
              </CardTitle>
              <CardDescription className="text-right">סה"כ {dashboardData?.todayTasks?.length || 0} משימות מתוכננות</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 text-right">נתונים מפורטים</CardTitle>
            <CardDescription className="text-right">גש לכל המידע על הלידים, רכבים ומשימות</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                  <Eye className="h-4 w-4 ml-2" />
                  סקירה
                </TabsTrigger>
                <TabsTrigger value="leads" className="data-[state=active]:bg-white">
                  <Users className="h-4 w-4 ml-2" />
                  לידים
                </TabsTrigger>
                <TabsTrigger value="cars" className="data-[state=active]:bg-white">
                  <Car className="h-4 w-4 ml-2" />
                  רכבים
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-white">
                  <CheckSquare className="h-4 w-4 ml-2" />
                  משימות
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">תצוגה כללית</h3>
                  <p className="text-gray-600 max-w-md mx-auto">בחר באחת הלשוניות למעלה כדי לראות פרטים מלאים על הלידים, הרכבים או המשימות שלך</p>
                </div>
              </TabsContent>
              
              <TabsContent value="leads" className="space-y-4">
                <LeadsTable />
              </TabsContent>
              
              <TabsContent value="cars" className="space-y-4">
                <CarsTable />
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-4">
                <TaskList extended={true} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Smart Insights */}
        <SmartInsights data={salesData} />
      </div>
    </div>
  );
}
