
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
  
  // Build hot actions based on real data
  const hotActions = [
    {
      id: 1,
      type: "untreated_lead",
      title: "לידים שלא טופלו",
      count: dashboardData?.untreatedLeads?.length || 0,
      description: `${dashboardData?.untreatedLeads?.length || 0} לידים מחכים למענה מעל 24 שעות`,
      color: dashboardData?.untreatedLeads?.length ? "bg-gradient-to-br from-red-500 to-red-600" : "bg-gradient-to-br from-gray-400 to-gray-500",
      textColor: "text-white",
      icon: AlertTriangle,
      action: "טפל עכשיו",
      route: "/leads",
      urgent: (dashboardData?.untreatedLeads?.length || 0) > 0
    },
    {
      id: 2,
      type: "pending_car",
      title: "רכבים לפרסום",
      count: dashboardData?.pendingCars?.length || 0,
      description: `${dashboardData?.pendingCars?.length || 0} רכבים מוכנים לפרסום ומחכים לפעולה`,
      color: dashboardData?.pendingCars?.length ? "bg-gradient-to-br from-orange-500 to-orange-600" : "bg-gradient-to-br from-gray-400 to-gray-500",
      textColor: "text-white",
      icon: Car,
      action: "פרסם רכבים",
      route: "/cars",
      urgent: false
    },
    {
      id: 3,
      type: "today_meetings",
      title: "משימות היום",
      count: dashboardData?.todayTasks?.length || 0,
      description: `${dashboardData?.todayTasks?.length || 0} משימות מתוכננות להיום`,
      color: dashboardData?.todayTasks?.length ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-gray-400 to-gray-500",
      textColor: "text-white",
      icon: Calendar,
      action: "צפה במשימות",
      route: "/tasks",
      urgent: false
    }
  ];

  const handleActionClick = (route: string) => {
    navigate(route);
  };
  
  if (isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#2F3C7E] to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="text-xl font-semibold text-[#2F3C7E] mb-2">טוען נתוני דשבורד...</div>
          <div className="text-sm text-slate-600">אנא המתן</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
        <AppHeader />

        {/* Hero Section */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-[#2F3C7E] to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#2F3C7E] to-blue-600 bg-clip-text text-transparent">
              דשבורד ניהול
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            מבט מקיף על כל הפעילות העסקית שלך במקום אחד
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="font-semibold text-slate-600 mb-1">סה"כ לידים</h3>
                  <p className="text-3xl font-bold text-[#2F3C7E]">{dashboardData?.totalLeadsCount || 0}</p>
                  <p className="text-sm text-slate-500 mt-1">לקוחות פוטנציאליים</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="font-semibold text-slate-600 mb-1">רכבים במלאי</h3>
                  <p className="text-3xl font-bold text-[#2F3C7E]">{dashboardData?.totalCarsCount || 0}</p>
                  <p className="text-sm text-slate-500 mt-1">זמינים למכירה</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Car className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="font-semibold text-slate-600 mb-1">משימות היום</h3>
                  <p className="text-3xl font-bold text-[#2F3C7E]">{dashboardData?.todayTasks?.length || 0}</p>
                  <p className="text-sm text-slate-500 mt-1">לביצוע עד הערב</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckSquare className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-white/60 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/5"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="font-semibold text-slate-600 mb-1">דורש טיפול</h3>
                  <p className="text-3xl font-bold text-[#2F3C7E]">{dashboardData?.untreatedLeads?.length || 0}</p>
                  <p className="text-sm text-slate-500 mt-1">לידים שלא טופלו</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">פעולות מהירות</h2>
            <p className="text-slate-600">משימות חשובות שדורשות תשומת לב</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {hotActions.map((action) => (
              <Card 
                key={action.id} 
                className={`relative overflow-hidden ${action.color} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${action.urgent ? 'ring-4 ring-red-200 ring-opacity-75' : ''}`}
                onClick={() => handleActionClick(action.route)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="text-right flex-1">
                    <CardTitle className={`text-xl font-bold ${action.textColor} mb-2 flex items-center gap-2 justify-end`}>
                      {action.urgent && action.count > 0 && (
                        <Badge variant="destructive" className="bg-red-700 text-white text-xs">
                          דחוף!
                        </Badge>
                      )}
                      {action.title}
                    </CardTitle>
                    <CardDescription className={`${action.textColor} opacity-90 text-base leading-relaxed`}>
                      {action.description}
                    </CardDescription>
                  </div>
                  <div className={`h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ml-4 shadow-lg`}>
                    <action.icon className={`h-8 w-8 ${action.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="secondary" 
                      size="lg"
                      className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl font-semibold text-base px-6 backdrop-blur-sm shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionClick(action.route);
                      }}
                    >
                      {action.action}
                    </Button>
                    <div className={`text-4xl font-bold ${action.textColor} drop-shadow-lg`}>
                      {action.count}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">יומן משימות</h2>
            <p className="text-slate-600">מבט כולל על כל המשימות והפגישות</p>
          </div>
          
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <MiniCalendar />
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        {dashboardData?.todayTasks && dashboardData.todayTasks.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">משימות להיום</h2>
              <p className="text-slate-600">המשימות החשובות ביותר שלך</p>
            </div>
            
            <div className="grid gap-4">
              {dashboardData.todayTasks.map((task) => (
                <Card key={task.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="text-right flex-1">
                        <h3 className="font-semibold text-lg text-[#2F3C7E] mb-1">{task.title}</h3>
                        <p className="text-slate-600">
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
                        className="ml-4 bg-white/50 hover:bg-white/80 border-slate-200"
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
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#2F3C7E] text-right flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ניתוח מכירות
              </CardTitle>
              <CardDescription className="text-right">ביצועים חודשיים ומגמות</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesAnalytics />
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#2F3C7E] text-right flex items-center gap-2">
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
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#2F3C7E] text-right">נתונים מפורטים</CardTitle>
            <CardDescription className="text-right">גש לכל המידע על הלידים, רכבים ומשימות</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 backdrop-blur-sm rounded-xl">
                <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Eye className="h-4 w-4 ml-2" />
                  סקירה
                </TabsTrigger>
                <TabsTrigger value="leads" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Users className="h-4 w-4 ml-2" />
                  לידים
                </TabsTrigger>
                <TabsTrigger value="cars" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Car className="h-4 w-4 ml-2" />
                  רכבים
                </TabsTrigger>
                <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <CheckSquare className="h-4 w-4 ml-2" />
                  משימות
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#2F3C7E] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2F3C7E] mb-2">תצוגה כללית</h3>
                  <p className="text-slate-600 max-w-md mx-auto">בחר באחת הלשוניות למעלה כדי לראות פרטים מלאים על הלידים, הרכבים או המשימות שלך</p>
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
