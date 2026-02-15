
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { MobileContainer } from "./MobileContainer";
import { MobileCard } from "./MobileCard";
import { MobileGrid } from "./MobileGrid";
import { MobileButton } from "./MobileButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Calendar, 
  Car,
  Users,
  CheckSquare,
  MessageCircle,
  ArrowLeft,
  LayoutDashboard
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
              <div className="h-20 bg-muted rounded-2xl"></div>
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
      colorClass: "text-red-600",
      bgClass: "bg-red-100",
      urgent: (dashboardData?.untreatedLeads?.length || 0) > 0,
      action: () => navigate("/leads")
    },
    {
      title: "משימות היום",
      value: dashboardData?.todayTasks?.length || 0,
      icon: CheckSquare,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
      urgent: false,
      action: () => navigate("/tasks")
    },
    {
      title: "רכבים לפרסום",
      value: dashboardData?.pendingCars?.length || 0,
      icon: Car,
      colorClass: "text-orange-600",
      bgClass: "bg-orange-100",
      urgent: false,
      action: () => navigate("/cars")
    },
    {
      title: "סה״כ רכבים",
      value: dashboardData?.totalCarsCount || 0,
      icon: Car,
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted",
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
      variant: "outline" as const,
      action: () => navigate("/cars?action=whatsapp")
    },
    {
      title: "פגישה חדשה",
      subtitle: "קבע פגישה עם לקוח",
      icon: Calendar,
      variant: "outline" as const,
      action: () => navigate("/tasks?action=add&type=meeting")
    }
  ];

  return (
    <MobileContainer withPadding={false}>
      {/* Modern gradient header */}
      <Card className="shadow-lg rounded-2xl border-0 overflow-hidden mx-4 mt-4">
        <div className="bg-gradient-to-l from-primary to-primary/80 p-5">
          <div className="flex items-center justify-between">
            <div className="text-primary-foreground text-right flex-1">
              <h1 className="text-xl font-bold mb-1">
                שלום! מה נעשה היום?
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                הכל מוכן לעוד יום מוצלח של מכירות
              </p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </Card>

      <div className="px-4 space-y-6 mt-6">
        {/* Quick Stats - Modern cards */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 text-right">מבט מהיר</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-95 bg-card shadow-lg border-2 rounded-2xl",
                    stat.urgent ? "ring-2 ring-red-300 border-red-200" : "border-border"
                  )}
                >
                  <button onClick={stat.action} className="w-full p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                      </div>
                      <div className={cn("p-2.5 rounded-xl", stat.bgClass)}>
                        <Icon className={cn("h-5 w-5", stat.colorClass)} />
                      </div>
                    </div>
                    {stat.urgent && stat.value > 0 && (
                      <Badge className="mt-2 bg-red-600 text-white border-0 shadow-md text-xs">
                        דחוף!
                      </Badge>
                    )}
                  </button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions - Modern styling */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4 text-right">פעולות מהירות</h2>
          <MobileGrid spacing="md">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <MobileButton
                  key={index}
                  variant={action.variant}
                  size="xl"
                  onClick={action.action}
                  icon={<Icon className="h-5 w-5" />}
                  className={cn(
                    "h-20 flex-col gap-1.5 shadow-lg rounded-2xl",
                    action.variant === "primary" 
                      ? "bg-gradient-to-l from-primary to-primary/80 text-primary-foreground border-0 hover:opacity-90" 
                      : "bg-card text-foreground border-2 border-border hover:bg-primary/10 hover:border-primary hover:text-primary"
                  )}
                >
                  <span className="font-bold text-sm">{action.title}</span>
                  <span className="text-xs opacity-80">{action.subtitle}</span>
                </MobileButton>
              );
            })}
          </MobileGrid>
        </div>

        {/* Today's Tasks Preview - Modern cards */}
        {dashboardData?.todayTasks && dashboardData.todayTasks.length > 0 && (
          <div className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <MobileButton 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/tasks")}
                fullWidth={false}
                icon={<ArrowLeft className="h-4 w-4" />}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-card rounded-xl"
              >
                צפה בהכל
              </MobileButton>
              <h2 className="text-lg font-bold text-foreground">משימות להיום</h2>
            </div>
            
            <MobileGrid spacing="sm">
              {dashboardData.todayTasks.slice(0, 3).map((task) => (
                <Card key={task.id as string} className="bg-card border-2 shadow-lg rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <MobileButton
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/tasks")}
                      fullWidth={false}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-card rounded-xl"
                    >
                      פתח
                    </MobileButton>
                    <div className="text-right flex-1 mr-3">
                      <h4 className="font-semibold text-foreground text-sm">{task.title as string}</h4>
                      <p className="text-xs text-muted-foreground">
                        {task.due_date ? new Date(task.due_date as string).toLocaleTimeString('he-IL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </MobileGrid>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
