
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, CheckSquare } from "lucide-react";
import { SalesAnalytics } from "@/components/analytics/SalesAnalytics";
import { TaskList } from "@/components/TaskList";

interface DashboardAnalyticsProps {
  todayTasksCount: number;
}

export function DashboardAnalytics({ todayTasksCount }: DashboardAnalyticsProps) {
  return (
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
          <CardDescription className="text-right">סה"כ {todayTasksCount} משימות מתוכננות</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskList />
        </CardContent>
      </Card>
    </div>
  );
}
