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
      <Card className="bg-card shadow-lg rounded-2xl border-2 overflow-hidden">
        <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <CardTitle className="text-foreground">ניתוח מכירות</CardTitle>
              <CardDescription>ביצועים חודשיים ומגמות</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <SalesAnalytics />
        </CardContent>
      </Card>
      
      <Card className="bg-card shadow-lg rounded-2xl border-2 overflow-hidden">
        <CardHeader className="bg-gradient-to-l from-primary/10 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <CardTitle className="text-foreground">משימות פעילות</CardTitle>
              <CardDescription>סה"כ {todayTasksCount} משימות מתוכננות</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <TaskList />
        </CardContent>
      </Card>
    </div>
  );
}
