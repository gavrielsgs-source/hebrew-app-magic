
import { AppHeader } from "@/components/layout/AppHeader";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { Activity, AlertCircle } from "lucide-react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardStats } from "./dashboard/DashboardStats";
import { DashboardActionCards } from "./dashboard/DashboardActionCards";
import { DashboardCalendarSection } from "./dashboard/DashboardCalendarSection";
import { DashboardTodayTasks } from "./dashboard/DashboardTodayTasks";
import { DashboardAnalytics } from "./dashboard/DashboardAnalytics";
import { DashboardDetailedTables } from "./dashboard/DashboardDetailedTables";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-xl font-bold text-gray-900 mb-2">שגיאה בטעינת נתונים</div>
          <div className="text-sm text-gray-600 mb-4">לא ניתן לטעון את נתוני הדשבורד</div>
          <Button onClick={() => refetch()} className="flex items-center gap-2 mx-auto">
            <Activity className="h-4 w-4" />
            נסה שנית
          </Button>
        </div>
      </div>
    );
  }
  
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
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-8 xl:px-8">
        <div className="space-y-8 py-6">
          <AppHeader />

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

          <SmartInsights data={salesData} />
        </div>
      </div>
    </div>
  );
}
