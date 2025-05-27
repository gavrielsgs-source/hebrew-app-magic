
import { AppHeader } from "@/components/layout/AppHeader";
import { SmartInsights } from "@/components/analytics/SmartInsights";
import { useSalesAnalytics } from "@/hooks/use-sales-analytics";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { DashboardStats } from "./dashboard/DashboardStats";
import { DashboardActionCards } from "./dashboard/DashboardActionCards";
import { DashboardCalendarSection } from "./dashboard/DashboardCalendarSection";
import { DashboardTodayTasks } from "./dashboard/DashboardTodayTasks";
import { DashboardAnalytics } from "./dashboard/DashboardAnalytics";
import { DashboardDetailedTables } from "./dashboard/DashboardDetailedTables";

export default function Dashboard() {
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
  );
}
