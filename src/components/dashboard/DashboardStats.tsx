
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
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white border border-red-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-600 mb-1">דורש טיפול</h3>
              <p className="text-3xl font-bold text-red-600">{dashboardData?.untreatedLeads?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">לידים שלא טופלו מעל 24 שעות</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-600 mb-1">משימות היום</h3>
              <p className="text-3xl font-bold text-yellow-600">{dashboardData?.todayTasks?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">משימות מתוכננות להיום</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-green-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-600 mb-1">רכבים במלאי</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData?.totalCarsCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">זמינים למכירה</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-600 mb-1">סה"כ לידים</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData?.totalLeadsCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">לקוחות פוטנציאליים</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
