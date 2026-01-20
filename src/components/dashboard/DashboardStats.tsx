import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Calendar, Car, Users } from "lucide-react";

interface DashboardStatsProps {
  dashboardData: {
    untreatedLeads?: any[];
    todayTasks?: any[];
    totalCarsCount?: number;
    totalLeadsCount?: number;
  } | undefined;
}

export function DashboardStats({ dashboardData }: DashboardStatsProps) {
  const stats = [
    {
      title: "דורש טיפול",
      value: dashboardData?.untreatedLeads?.length || 0,
      subtitle: "לידים שלא טופלו מעל 24 שעות",
      icon: AlertTriangle,
      colorClass: "text-red-600",
      bgClass: "bg-red-100",
      borderClass: "border-red-200",
    },
    {
      title: "משימות היום",
      value: dashboardData?.todayTasks?.length || 0,
      subtitle: "משימות מתוכננות להיום",
      icon: Calendar,
      colorClass: "text-yellow-600",
      bgClass: "bg-yellow-100",
      borderClass: "border-yellow-200",
    },
    {
      title: "רכבים במלאי",
      value: dashboardData?.totalCarsCount || 0,
      subtitle: "זמינים למכירה",
      icon: Car,
      colorClass: "text-green-600",
      bgClass: "bg-green-100",
      borderClass: "border-green-200",
    },
    {
      title: 'סה"כ לידים',
      value: dashboardData?.totalLeadsCount || 0,
      subtitle: "לקוחות פוטנציאליים",
      icon: Users,
      colorClass: "text-blue-600",
      bgClass: "bg-blue-100",
      borderClass: "border-blue-200",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`bg-white border-2 ${stat.borderClass} shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className={`text-3xl font-bold ${stat.colorClass}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.bgClass} rounded-xl flex items-center justify-center`}
                >
                  <Icon className={`h-6 w-6 ${stat.colorClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
