import { AppHeader } from "@/components/layout/AppHeader";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { Activity, AlertCircle, LayoutDashboard } from "lucide-react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardStats } from "./dashboard/DashboardStats";
import { DashboardActionCards } from "./dashboard/DashboardActionCards";
import { DashboardCalendarSection } from "./dashboard/DashboardCalendarSection";
import { DashboardTodayTasks } from "./dashboard/DashboardTodayTasks";
import { DashboardAnalytics } from "./dashboard/DashboardAnalytics";
import { DashboardDetailedTables } from "./dashboard/DashboardDetailedTables";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { TrialBanner } from "@/components/subscription/TrialBanner";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: salesData } = useSalesAnalytics();
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError, refetch } = useDashboardData();
  const navigate = useNavigate();
  
  console.log('Dashboard rendering:', { 
    user: !!user, 
    dashboardData: !!dashboardData, 
    isDashboardLoading, 
    dashboardError: !!dashboardError 
  });
  
  const handleActionClick = (route: string) => {
    navigate(route);
  };

  // Error state
  if (dashboardError) {
    console.error('Dashboard error:', dashboardError);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Card className="text-center max-w-md mx-auto p-8 rounded-2xl shadow-lg border-2">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="text-xl font-bold text-foreground mb-2">שגיאה בטעינת נתונים</div>
          <div className="text-sm text-muted-foreground mb-6">לא ניתן לטעון את נתוני הדשבורד</div>
          <Button 
            onClick={() => refetch()} 
            className="flex items-center gap-2 mx-auto rounded-xl"
          >
            <Activity className="h-4 w-4" />
            נסה שנית
          </Button>
        </Card>
      </div>
    );
  }
  
  if (isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="text-center p-8 rounded-2xl shadow-lg border-2">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <LayoutDashboard className="h-7 w-7 text-primary-foreground animate-pulse" />
          </div>
          <div className="text-lg font-semibold text-foreground mb-2">טוען נתוני דשבורד...</div>
          <div className="text-sm text-muted-foreground">אנא המתן</div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-8 xl:px-8">
        <div className="space-y-6 py-6">
          <AppHeader />

          <TrialBanner />

          <DashboardHeader />

          <DashboardStats dashboardData={dashboardData} />

          <DashboardActionCards 
            dashboardData={dashboardData} 
            handleActionClick={handleActionClick} 
          />

          <DashboardCalendarSection />

          <DashboardTodayTasks todayTasks={dashboardData?.todayTasks} />

          <DashboardAnalytics todayTasksCount={dashboardData?.todayTasks?.length || 0} />

          <DashboardDetailedTables />

          <SmartInsights />
        </div>
      </div>
    </div>
  );
}
