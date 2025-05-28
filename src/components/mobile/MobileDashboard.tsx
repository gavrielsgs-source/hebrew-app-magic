
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
      <MobileHeader 
        title="שלום! מה נעשה היום?"
        subtitle="הכל מוכן לעוד יום מוצלח של מכירות"
      />

      <div className="px-4 space-y-8">
        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">מבט מהיר</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <MobileCard 
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:scale-105",
                    stat.urgent ? "ring-2 ring-red-200 bg-red-50" : "bg-white"
                  )}
                  contentClassName="p-4"
                >
                  <button onClick={stat.action} className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                      </div>
                      <div className={cn("p-3 rounded-2xl", stat.color)}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    {stat.urgent && stat.value > 0 && (
                      <Badge variant="destructive" className="mt-3 bg-red-500">
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">פעולות מהירות</h2>
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
                  className="h-20 flex-col gap-2"
                >
                  <span className="font-bold">{action.title}</span>
                  <span className="text-sm opacity-80">{action.subtitle}</span>
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
              >
                צפה בהכל
              </MobileButton>
              <h2 className="text-xl font-bold text-gray-900">משימות להיום</h2>
            </div>
            
            <MobileGrid spacing="sm">
              {dashboardData.todayTasks.slice(0, 3).map((task) => (
                <MobileCard key={task.id as string} className="bg-blue-50">
                  <div className="flex items-center justify-between">
                    <MobileButton
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/tasks")}
                      fullWidth={false}
                    >
                      פתח
                    </MobileButton>
                    <div className="text-right flex-1 mr-3">
                      <h4 className="font-semibold text-gray-900">{task.title as string}</h4>
                      <p className="text-sm text-gray-600">
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
