
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface AgendaViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function AgendaView({ tasks, onTaskClick }: AgendaViewProps) {
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

  const getPriorityBadgeColor = (priority: string | null | undefined) => {
    switch(priority) {
      case 'high': return "bg-red-50 text-red-700 border-red-200";
      case 'medium': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'low': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return isSameDay(new Date(task.due_date), new Date());
  }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  return (
    <div className="space-y-6">
      <div className="text-center py-6 border-b-2 border-border/30 bg-muted/20 rounded-xl">
        <h3 className="text-xl font-bold text-foreground">
          סדר יום ליום {format(new Date(), "dd/MM/yyyy")}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {todayTasks.length > 0 
            ? `${todayTasks.length} משימות מתוכננות להיום` 
            : "אין משימות מתוכננות להיום"}
        </p>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto space-y-3 px-1">
        {todayTasks.map((task, index) => (
          <div
            key={task.id}
            className={cn(
              "p-4 rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all duration-200 group",
              getTaskTypeColor(task)
            )}
            onClick={() => onTaskClick(task)}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-background/80 text-foreground font-bold text-sm shadow-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-bold text-base mb-2",
                    task.status === 'completed' && "line-through opacity-60"
                  )}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-sm opacity-80 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-lg text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {format(new Date(task.due_date!), "HH:mm")}
                    </div>
                    <Badge variant="outline" className="rounded-lg font-medium text-xs border-2">
                      {task.type === 'call' ? 'שיחה' : 
                       task.type === 'meeting' ? 'פגישה' : 
                       task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                    </Badge>
                    <Badge className={cn("rounded-lg font-medium text-xs border", getPriorityBadgeColor(task.priority))}>
                      {task.priority === 'high' ? 'עדיפות גבוהה' : 
                       task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
                    </Badge>
                  </div>
                </div>
              </div>
              {task.status === 'completed' && (
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {todayTasks.length === 0 && (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-xl font-bold text-foreground mb-2">אין משימות להיום</p>
            <p className="text-sm text-muted-foreground">תיהנה מיום פנוי! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
