
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface DashboardTodayTasksProps {
  todayTasks: any[] | undefined;
}

export function DashboardTodayTasks({ todayTasks }: DashboardTodayTasksProps) {
  const navigate = useNavigate();

  if (!todayTasks || todayTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">משימות להיום</h2>
      
      <div className="grid gap-4">
        {todayTasks.map((task) => (
          <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-right flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {task.type === "meeting" ? "פגישה" : "משימה"} • 
                    {new Date(task.due_date).toLocaleTimeString('he-IL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/tasks")}
                  className="mr-4"
                >
                  פתח
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
