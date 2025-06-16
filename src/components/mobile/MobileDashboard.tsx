
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { MobileContainer } from "./MobileContainer";
import { MobileHeader } from "./MobileHeader";
import { MobileCard } from "./MobileCard";
import { MobileGrid } from "./MobileGrid";
import { MobileButton } from "./MobileButton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  Car,
  Users,
  CheckSquare,
  MessageCircle,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileDashboard() {
  const { data: dashboardData, isLoading } = useDashboardData();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <MobileContainer>
        <MobileGrid spacing="lg">
          {[1, 2, 3, 4].map((i) => (
            <MobileCard key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-2xl"></div>
            </MobileCard>
          ))}
        </MobileGrid>
      </MobileContainer>
    );
  }

  const quickStats = [
    {
      title: "לידים להיום",
      value: dashboardData?.untreatedLeads?.length || 0,
      icon: Users,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      urgent: (dashboardData?.untreatedLeads?.length || 0) > 0,
      action: () => navigate("/leads")
    },
    {
      title: "משימות היום",
      value: dashboardData?.todayTasks?.length || 0,
      icon: CheckSquare,
      color: "bg-gradient-to-br from-carslead-blue to-blue-600",
      urgent: false,
      action: () => navigate("/tasks")
    },
    {
      title: "רכבים לפרסום",
      value: dashboardData?.pendingCars?.length || 0,
      icon: Car,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      urgent: false,
      action: () => navigate("/cars")
    },
    {
      title: "סה״כ רכבים",
      value: dashboardData?.totalCarsCount || 0,
      icon: Car,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      urgent: false,
      action: () => navigate("/cars")
    }
  ];

  const quickActions = [
    {
      title: "ליד חדש",
      subtitle: "הוסף לקוח פוטנציאלי",
      icon: Plus,
      variant: "primary" as const,
      action: () => navigate("/leads?action=add")
    },
    {
      title: "שלח רכב",
      subtitle: "שלח רכב בוואטסאפ",
      icon: MessageCircle,
      variant: "success" as const,
      action: () => navigate("/cars?action=whatsapp")
    },
    {
      title: "פגישה חדשה",
      subtitle: "קבע פגישה עם לקוח",
      icon: Calendar,
      variant: "secondary" as const,
      action: () => navigate("/tasks?action=add&type=meeting")
    }
  ];

  return (
    <MobileContainer withPadding={false}>
      {/* Main header with unified brand gradient */}
      <div className="bg-carslead-gradient shadow-lg mx-4 mt-4 p-6 rounded-3xl border border-white/20">
        <h1 className="text-xl font-bold text-white mb-2 text-right">
          שלום! מה נעשה היום?
        </h1>
        <p className="text-base text-white/90 text-right">
          הכל מוכן לעוד יום מוצלח של מכירות
        </p>
      </div>

      <div className="px-4 space-y-8 mt-6">
        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-bold text-carslead-purple mb-4 text-right">מבט מהיר</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <MobileCard 
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95",
                    stat.urgent ? "ring-2 ring-red-200 bg-red-50 shadow-lg" : "bg-white shadow-md hover:shadow-lg"
                  )}
                  contentClassName="p-4"
                >
                  <button onClick={stat.action} className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-carslead-darkgray">{stat.value}</p>
                        <p className="text-sm text-carslead-purple font-semibold">{stat.title}</p>
                      </div>
                      <div className={cn("p-3 rounded-2xl shadow-md", stat.color)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {stat.urgent && stat.value > 0 && (
                      <Badge className="mt-3 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md">
                        דחוף!
                      </Badge>
                    )}
                  </button>
                </MobileCard>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-carslead-purple mb-6 text-right">פעולות מהירות</h2>
          <MobileGrid spacing="md">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <MobileButton
                  key={index}
                  variant={action.variant}
                  size="xl"
                  onClick={action.action}
                  icon={<Icon className="h-6 w-6" />}
                  className="h-20 flex-col gap-2 shadow-lg"
                >
                  <span className="font-bold">{action.title}</span>
                  <span className="text-sm opacity-90">{action.subtitle}</span>
                </MobileButton>
              );
            })}
          </MobileGrid>
        </div>

        {/* Today's Tasks Preview */}
        {dashboardData?.todayTasks && dashboardData.todayTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <MobileButton 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/tasks")}
                fullWidth={false}
                icon={<ArrowLeft className="h-4 w-4" />}
                className="border-carslead-purple text-carslead-purple hover:bg-carslead-purple hover:text-white"
              >
                צפה בהכל
              </MobileButton>
              <h2 className="text-xl font-bold text-carslead-purple">משימות להיום</h2>
            </div>
            
            <MobileGrid spacing="sm">
              {dashboardData.todayTasks.slice(0, 3).map((task) => (
                <MobileCard key={task.id as string} className="bg-gradient-to-br from-carslead-blue/10 to-blue-50 border border-carslead-blue/20 shadow-md">
                  <div className="flex items-center justify-between">
                    <MobileButton
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/tasks")}
                      fullWidth={false}
                      className="border-carslead-blue text-carslead-blue hover:bg-carslead-blue hover:text-white"
                    >
                      פתח
                    </MobileButton>
                    <div className="text-right flex-1 mr-3">
                      <h4 className="font-semibold text-carslead-darkgray">{task.title as string}</h4>
                      <p className="text-sm text-carslead-purple">
                        {task.due_date ? new Date(task.due_date as string).toLocaleTimeString('he-IL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                      </p>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </MobileGrid>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
