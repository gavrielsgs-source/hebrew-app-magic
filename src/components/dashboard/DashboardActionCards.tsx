import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Car, CheckSquare, Zap } from "lucide-react";

interface DashboardActionCardsProps {
  dashboardData: {
    untreatedLeads?: any[];
    pendingCars?: any[];
    todayTasks?: any[];
  } | undefined;
  handleActionClick: (route: string) => void;
}

export function DashboardActionCards({ dashboardData, handleActionClick }: DashboardActionCardsProps) {
  const actionCards = [
    {
      title: "לידים שלא טופלו",
      count: dashboardData?.untreatedLeads?.length || 0,
      description: "לידים מחכים למענה מעל 24 שעות",
      icon: AlertTriangle,
      route: "/leads",
      buttonText: "טפל עכשיו",
      activeColorClass: "border-red-300 bg-gradient-to-br from-red-50 to-red-100/50",
      inactiveColorClass: "border-muted bg-muted/30",
      iconBgClass: "bg-red-600",
      valueColorClass: "text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    {
      title: "רכבים לפרסום",
      count: dashboardData?.pendingCars?.length || 0,
      description: "רכבים מוכנים לפרסום",
      icon: Car,
      route: "/cars",
      buttonText: "פרסם רכבים",
      activeColorClass: "border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/50",
      inactiveColorClass: "border-muted bg-muted/30",
      iconBgClass: "bg-orange-600",
      valueColorClass: "text-orange-600",
      buttonClass: "bg-orange-600 hover:bg-orange-700 text-white",
    },
    {
      title: "משימות היום",
      count: dashboardData?.todayTasks?.length || 0,
      description: "משימות מתוכננות להיום",
      icon: CheckSquare,
      route: "/tasks",
      buttonText: "צפה במשימות",
      activeColorClass: "border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50",
      inactiveColorClass: "border-muted bg-muted/30",
      iconBgClass: "bg-blue-600",
      valueColorClass: "text-blue-600",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-l from-primary/10 to-transparent p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-foreground">מה צריך לטפל עכשיו?</h2>
              <p className="text-sm text-muted-foreground">משימות חשובות שדורשות תשומת לב מיידית</p>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        {actionCards.map((card) => {
          const Icon = card.icon;
          const isActive = card.count > 0;
          
          return (
            <Card
              key={card.title}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-2xl border-2 ${
                isActive ? card.activeColorClass : card.inactiveColorClass
              }`}
              onClick={() => handleActionClick(card.route)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{card.title}</h3>
                  <div className={`w-10 h-10 ${card.iconBgClass} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {card.count} {card.description}
                </p>
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    className={`${card.buttonClass} rounded-xl h-9`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(card.route);
                    }}
                  >
                    {card.buttonText}
                  </Button>
                  <span className={`text-2xl font-bold ${card.valueColorClass}`}>
                    {card.count}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
