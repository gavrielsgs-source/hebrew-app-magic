
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, ArrowLeft } from "lucide-react";
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
    
    if (!taskDate) return "bg-muted/50 border-border";
    
    if (isSameDay(taskDate, now)) {
      return "bg-amber-50 border-amber-300 text-amber-900";
    } else if (taskDate < now) {
      return "bg-red-50 border-red-300 text-red-900";
    } else {
      return "bg-blue-50 border-blue-300 text-blue-900";
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    switch(priority) {
      case 'high': return "bg-red-50 text-red-700 border-red-200";
      case 'medium': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'low': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  return (
    <Card className="shadow-lg border-2 border-border/50 rounded-2xl overflow-hidden sticky top-4">
      <CardHeader className="pb-4 bg-gradient-to-l from-primary/5 to-transparent border-b border-border/30">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          משימות ליום {format(selectedDate, "dd/MM/yyyy")}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedDateTasks.length} משימות
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {selectedDateTasks.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed border-muted-foreground/20">
            <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">אין משימות ליום זה</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDateTasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  "p-3.5 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all duration-200 group",
                  getTaskTypeColor(task)
                )}
                onClick={() => onTaskClick(task)}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    "font-semibold text-sm flex-1",
                    task.status === 'completed' && "line-through opacity-60"
                  )}>
                    {task.title}
                  </h4>
                  <ArrowLeft className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
                <div className="flex items-center justify-between mt-2.5 text-xs">
                  <div className="flex items-center gap-1.5 bg-background/60 px-2 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />
                    {format(new Date(task.due_date!), "HH:mm")}
                  </div>
                  <Badge className={cn("text-xs rounded-lg font-medium border", getPriorityColor(task.priority))}>
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
