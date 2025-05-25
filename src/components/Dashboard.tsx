import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Calendar, TrendingUp, Eye, Clock } from "lucide-react";
import { LeadsTable } from "@/components/LeadsTable";
import { CarsTable } from "@/components/CarsTable";
import { TaskList } from "@/components/TaskList";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CarSleadLogoSVG = () => (
  <svg width="48" height="48" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="80" height="80" rx="10" fill="#1A1F2C"/>
    <path d="M20 40C20 28.9543 28.9543 20 40 20C51.0457 20 60 28.9543 60 40C60 51.0457 51.0457 60 40 60C28.9543 60 20 51.0457 20 40Z" fill="#33C3F0"/>
    <path d="M25 40H55" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <path d="M35 30L40 35L45 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M35 50L40 45L45 50" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { data: salesData } = useSalesAnalytics();
  const navigate = useNavigate();
  
  // Mock data for hot actions - in real implementation, this would come from hooks
  const hotActions = [
    {
      id: 1,
      type: "untreated_lead",
      title: "לידים שלא טופלו",
      count: 3,
      description: "3 לידים מחכים למענה מעל 24 שעות",
      color: "bg-red-500",
      textColor: "text-white",
      icon: AlertTriangle,
      action: "טפל עכשיו",
      route: "/leads",
      urgent: true
    },
    {
      id: 2,
      type: "pending_car",
      title: "רכבים לפרסום",
      count: 2,
      description: "2 רכבים מוכנים לפרסום ומחכים לפעולה",
      color: "bg-orange-500",
      textColor: "text-white",
      icon: TrendingUp,
      action: "פרסם רכבים",
      route: "/cars",
      urgent: false
    },
    {
      id: 3,
      type: "today_meetings",
      title: "פגישות היום",
      count: 1,
      description: "פגישה אחת מתוכננת להיום",
      color: "bg-blue-500",
      textColor: "text-white",
      icon: Calendar,
      action: "צפה בפגישות",
      route: "/tasks",
      urgent: false
    }
  ];

  const handleActionClick = (route: string) => {
    navigate(route);
  };
  
  return (
    <div className="flex min-h-screen flex-col space-y-6 p-2 md:p-8" dir="rtl">
      <AppHeader />

      {/* Hot Actions Section - Enhanced */}
      <div className="space-y-4">
        <div className="text-right">
          <h2 className="text-3xl font-bold text-[#2F3C7E] mb-2">מה צריך לטפל עכשיו?</h2>
          <p className="text-gray-600 text-lg">משימות דחופות שדורשות תשומת לב מיידית</p>
        </div>
        
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
          {hotActions.map((action) => (
            <Card 
              key={action.id} 
              className={`${action.color} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl transform hover:scale-105 cursor-pointer ${action.urgent ? 'ring-4 ring-red-200 animate-pulse' : ''}`}
              onClick={() => handleActionClick(action.route)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="text-right flex-1">
                  <CardTitle className={`text-xl font-bold ${action.textColor} mb-2`}>
                    {action.title}
                  </CardTitle>
                  <CardDescription className={`${action.textColor} opacity-90 text-base leading-relaxed`}>
                    {action.description}
                  </CardDescription>
                </div>
                <div className={`h-16 w-16 rounded-full bg-white/20 flex items-center justify-center ml-4`}>
                  <action.icon className={`h-8 w-8 ${action.textColor}`} />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl font-bold text-lg px-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(action.route);
                    }}
                  >
                    {action.action}
                  </Button>
                  <div className={`text-4xl font-extrabold ${action.textColor}`}>
                    {action.count}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Insights Section */}
      <div className="space-y-4">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">תובנות מהירות</h2>
          <p className="text-gray-600">המלצות אוטומטיות לשיפור הביצועים</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-l from-blue-50 to-white border border-blue-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="font-bold text-lg text-[#2F3C7E] mb-1">זמן מענה ללידים</h3>
                  <p className="text-gray-600 text-sm">ממוצע של 4.2 שעות - רצוי לשפר ל-2 שעות</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-l from-green-50 to-white border border-green-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="font-bold text-lg text-[#2F3C7E] mb-1">רכבים פעילים</h3>
                  <p className="text-gray-600 text-sm">85% מהרכבים פורסמו השבוע - ביצועים מעולים!</p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <div className="text-right">
          <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">נתונים ותובנות</h2>
          <p className="text-gray-600">מעקב אחר ביצועים ומגמות בעסק</p>
        </div>
        
        <div className={`grid gap-6 grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'}`}>
          <div className="min-h-[340px] flex flex-col">
            <SalesAnalytics />
          </div>
          {!isMobile ? (
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 min-h-[340px] flex flex-col rounded-2xl">
              <CardHeader>
                <CardTitle className="font-rubik text-[#2F3C7E] text-right">משימות להיום</CardTitle>
                <CardDescription className="font-rubik text-right">סה"כ 7 משימות מתוכננות</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <TaskList />
              </CardContent>
            </Card>
          ) : null}
        </div>
        
        {/* Smart Insights with RTL alignment */}
        <div className="space-y-4">
          <SmartInsights data={salesData} />
        </div>
        
        {isMobile ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 min-h-[340px] flex flex-col rounded-2xl">
            <CardHeader>
              <CardTitle className="font-rubik text-[#2F3C7E] text-right">משימות להיום</CardTitle>
              <CardDescription className="font-rubik text-right">סה"כ 7 משימות מתוכננות</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <TaskList />
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className={`font-rubik bg-white border border-gray-200 p-1 rounded-2xl shadow-sm w-full ${isMobile ? 'flex flex-wrap grid-cols-2' : 'flex flex-nowrap'} overflow-x-auto`}>
          <TabsTrigger value="overview" className="font-rubik data-[state=active]:bg-[#2F3C7E] data-[state=active]:text-white flex-1 rounded-xl">סיכום</TabsTrigger>
          <TabsTrigger value="leads" className="font-rubik data-[state=active]:bg-[#2F3C7E] data-[state=active]:text-white flex-1 rounded-xl">לידים</TabsTrigger>
          <TabsTrigger value="cars" className="font-rubik data-[state=active]:bg-[#2F3C7E] data-[state=active]:text-white flex-1 rounded-xl">רכבים</TabsTrigger>
          <TabsTrigger value="tasks" className="font-rubik data-[state=active]:bg-[#2F3C7E] data-[state=active]:text-white flex-1 rounded-xl">משימות</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8">
          <div className="text-center p-8">
            <Eye className="h-12 w-12 text-[#2F3C7E] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#2F3C7E] mb-2">תצוגה כללית</h3>
            <p className="text-gray-600">השתמש בלשוניות למעלה כדי לראות פרטים נוספים</p>
          </div>
        </TabsContent>
        <TabsContent value="leads" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-rubik text-[#2F3C7E] text-right">לידים</CardTitle>
              <CardDescription className="font-rubik text-right">רשימת כל הלידים במערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cars" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-rubik text-[#2F3C7E] text-right">רכבים במלאי</CardTitle>
              <CardDescription className="font-rubik text-right">רשימת הרכבים הזמינים למכירה</CardDescription>
            </CardHeader>
            <CardContent>
              <CarsTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-rubik text-[#2F3C7E] text-right">משימות</CardTitle>
              <CardDescription className="font-rubik text-right">רשימת המשימות והתזכורות שלך</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskList extended={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
