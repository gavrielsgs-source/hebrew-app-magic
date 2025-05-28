
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface SelectedDateTasksProps {
  tasks: Task[];
  selectedDate: Date;
  onTaskClick: (task: Task) => void;
}

export function SelectedDateTasks({ tasks, selectedDate, onTaskClick }: SelectedDateTasksProps) {
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), date);
    });
  };

  const getTaskTypeColor = (task: Task) => {
    const now = new Date();
    const taskDate = task.due_date ? new Date(task.due_date) : null;
    
    if (!taskDate) return "bg-gray-100 border-gray-300";
    
    if (isSameDay(taskDate, now)) {
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    } else if (taskDate < now) {
      return "bg-red-100 border-red-300 text-red-800";
    } else {
      return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-[#2F3C7E]">
          משימות ליום {format(selectedDate, "dd/MM/yyyy")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">אין משימות ליום זה</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateTasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all",
                  getTaskTypeColor(task)
                )}
                onClick={() => onTaskClick(task)}
              >
                <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.due_date!), "HH:mm")}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.priority === 'high' ? 'גבוהה' : 
                     task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
