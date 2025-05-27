
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Send, 
  Phone, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Car,
  Users,
  CheckSquare,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MobileDashboard() {
  const { data: dashboardData, isLoading } = useDashboardData();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const quickStats = [
    {
      title: "לידים להיום",
      value: dashboardData?.untreatedLeads?.length || 0,
      icon: Users,
      color: "bg-red-500",
      urgent: (dashboardData?.untreatedLeads?.length || 0) > 0,
      action: () => navigate("/leads")
    },
    {
      title: "משימות היום",
      value: dashboardData?.todayTasks?.length || 0,
      icon: CheckSquare,
      color: "bg-blue-500",
      urgent: false,
      action: () => navigate("/tasks")
    },
    {
      title: "רכבים לפרסום",
      value: dashboardData?.pendingCars?.length || 0,
      icon: Car,
      color: "bg-orange-500",
      urgent: false,
      action: () => navigate("/cars")
    },
    {
      title: "סה״כ רכבים",
      value: dashboardData?.totalCarsCount || 0,
      icon: Car,
      color: "bg-green-500",
      urgent: false,
      action: () => navigate("/cars")
    }
  ];

  const quickActions = [
    {
      title: "ליד חדש",
      subtitle: "הוסף לקוח פוטנציאלי",
      icon: Plus,
      color: "bg-[#2F3C7E]",
      action: () => navigate("/leads?action=add")
    },
    {
      title: "שלח רכב",
      subtitle: "שלח רכב בוואטסאפ",
      icon: MessageCircle,
      color: "bg-green-600",
      action: () => navigate("/cars?action=whatsapp")
    },
    {
      title: "פגישה חדשה",
      subtitle: "קבע פגישה עם לקוח",
      icon: Calendar,
      color: "bg-purple-600",
      action: () => navigate("/tasks?action=add&type=meeting")
    }
  ];

  return (
    <div className="space-y-6 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#2F3C7E] to-[#4CAF50] text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-2">שלום! מה נעשה היום?</h1>
        <p className="text-white/80">הכל מוכן לעוד יום מוצלח של מכירות</p>
      </div>

      {/* Quick Stats */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-bold text-gray-900 mb-3">מבט מהיר</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 border-0 shadow-md",
                  stat.urgent ? "ring-2 ring-red-200 bg-red-50" : "bg-white"
                )}
                onClick={stat.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                    </div>
                    <div className={cn("p-3 rounded-full", stat.color)}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  {stat.urgent && stat.value > 0 && (
                    <Badge variant="destructive" className="mt-2 bg-red-500">
                      דחוף!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-bold text-gray-900 mb-3">פעולות מהירות</h2>
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer transition-all duration-200 hover:scale-[1.02] border-0 shadow-md"
                onClick={action.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-4 rounded-2xl", action.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.subtitle}</p>
                    </div>
                    <ArrowLeft className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Today's Tasks Preview */}
      {dashboardData?.todayTasks && dashboardData.todayTasks.length > 0 && (
        <div className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/tasks")}
              className="text-[#2F3C7E]"
            >
              צפה בהכל
              <ArrowLeft className="h-4 w-4 mr-1" />
            </Button>
            <h2 className="text-lg font-bold text-gray-900">משימות להיום</h2>
          </div>
          
          <div className="space-y-2">
            {dashboardData.todayTasks.slice(0, 3).map((task) => (
              <Card key={task.id} className="border-0 shadow-sm bg-blue-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/tasks")}
                    >
                      פתח
                    </Button>
                    <div className="text-right flex-1 mr-3">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-600">
                        {new Date(task.due_date).toLocaleTimeString('he-IL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
