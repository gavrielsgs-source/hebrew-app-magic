
import { format } from "date-fns";
import { MobileCard } from "@/components/mobile/MobileCard";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Check, X, Calendar } from "lucide-react";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface MobileTaskCalendarCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onTaskStatusToggle: (task: Task, e: React.MouseEvent) => void;
  onEditTask: (task: Task, e: React.MouseEvent) => void;
  showDate?: boolean;
}

export function MobileTaskCalendarCard({
  task,
  onTaskClick,
  onTaskStatusToggle,
  onEditTask,
  showDate = false
}: MobileTaskCalendarCardProps) {
  const getTaskTypeColor = (task: Task) => {
    if (task.status === 'completed') {
      return "bg-card border-border/50";
    }
    
    const now = new Date();
    const taskDate = task.due_date ? new Date(task.due_date) : null;
    
    if (!taskDate) return "bg-card border-border/50";
    
    // Priority takes precedence
    if (task.priority === 'high') {
      return "bg-card border-red-300";
    }
    
    if (taskDate < now) {
      return "bg-card border-red-300";
    } else {
      return "bg-card border-border/50";
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

  const getTypeBadgeColor = (type: string | null | undefined) => {
    switch(type) {
      case 'call': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'meeting': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'follow_up': return "bg-violet-50 text-violet-700 border-violet-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div
      className="transition-all duration-200"
      onClick={() => onTaskClick(task)}
      dir="rtl"
    >
      <MobileCard className={cn(
        "cursor-pointer hover:shadow-xl transition-all duration-300 min-h-[100px] rounded-2xl border-2 shadow-lg hover:scale-[1.01] active:scale-[0.99]",
        getTaskTypeColor(task),
        task.status === 'completed' && "opacity-70"
      )}>
        <div className="p-5 space-y-4">
          {/* Header section with title and date/time */}
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-bold text-lg flex-1 leading-relaxed text-right text-foreground",
              task.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mr-3">
              {showDate && task.due_date && (
                <div className="flex items-center gap-1.5 text-sm bg-primary/10 px-3 py-2 rounded-xl font-semibold shadow-sm border border-primary/20">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span className="text-primary font-bold">
                    {format(new Date(task.due_date), "dd/MM")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm bg-muted/50 px-3 py-2 rounded-xl shadow-sm border border-border/50">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {task.due_date && format(new Date(task.due_date), "HH:mm")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed text-right">
              {task.description}
            </p>
          )}
          
          {/* Footer with badges and actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <Badge className={cn("text-xs px-2.5 py-1 rounded-lg border font-semibold", getTypeBadgeColor(task.type))}>
                {task.type === 'call' ? 'שיחה' : 
                 task.type === 'meeting' ? 'פגישה' : 
                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
              </Badge>
              <Badge className={cn("text-xs px-2.5 py-1 rounded-lg border font-semibold", getPriorityBadgeColor(task.priority))}>
                {task.priority === 'high' ? 'גבוהה' : 
                 task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
              </Badge>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={(e) => onTaskStatusToggle(task, e)}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 border-2",
                  task.status === 'completed' 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100" 
                    : "bg-card text-muted-foreground hover:bg-muted/50 border-border/50"
                )}
              >
                {task.status === 'completed' ? 
                  <X className="h-5 w-5" /> : 
                  <Check className="h-5 w-5" />
                }
              </button>
              <button
                onClick={(e) => onEditTask(task, e)}
                className="p-2.5 rounded-xl bg-card text-muted-foreground hover:bg-muted/50 transition-all duration-300 shadow-sm border-2 border-border/50 hover:scale-110 active:scale-95"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>
  );
}
