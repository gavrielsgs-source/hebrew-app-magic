
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Car, CheckSquare } from "lucide-react";

interface DashboardActionCardsProps {
  dashboardData: {
    untreatedLeads?: any[];
    pendingCars?: any[];
    todayTasks?: any[];
  } | undefined;
  handleActionClick: (route: string) => void;
}

export function DashboardActionCards({ dashboardData, handleActionClick }: DashboardActionCardsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">מה צריך לטפל עכשיו?</h2>
        <p className="text-gray-600">משימות חשובות שדורשות תשומת לב מיידית</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        {/* Urgent Leads Card */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            (dashboardData?.untreatedLeads?.length || 0) > 0 
              ? 'bg-red-50 border-red-200 hover:bg-red-100' 
              : 'bg-gray-50 border-gray-200'
          }`}
          onClick={() => handleActionClick('/leads')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">לידים שלא טופלו</h3>
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {dashboardData?.untreatedLeads?.length || 0} לידים מחכים למענה מעל 24 שעות
            </p>
            <div className="flex items-center justify-between">
              <Button 
                size="sm" 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick('/leads');
                }}
              >
                טפל עכשיו
              </Button>
              <span className="text-2xl font-bold text-red-600">
                {dashboardData?.untreatedLeads?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Cars Card */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            (dashboardData?.pendingCars?.length || 0) > 0 
              ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' 
              : 'bg-gray-50 border-gray-200'
          }`}
          onClick={() => handleActionClick('/cars')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">רכבים לפרסום</h3>
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Car className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {dashboardData?.pendingCars?.length || 0} רכבים מוכנים לפרסום
            </p>
            <div className="flex items-center justify-between">
              <Button 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick('/cars');
                }}
              >
                פרסם רכבים
              </Button>
              <span className="text-2xl font-bold text-orange-600">
                {dashboardData?.pendingCars?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Today Tasks Card */}
        <Card 
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            (dashboardData?.todayTasks?.length || 0) > 0 
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
              : 'bg-gray-50 border-gray-200'
          }`}
          onClick={() => handleActionClick('/tasks')}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">משימות היום</h3>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {dashboardData?.todayTasks?.length || 0} משימות מתוכננות להיום
            </p>
            <div className="flex items-center justify-between">
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick('/tasks');
                }}
              >
                צפה במשימות
              </Button>
              <span className="text-2xl font-bold text-blue-600">
                {dashboardData?.todayTasks?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
