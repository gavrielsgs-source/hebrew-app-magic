
import { format } from "date-fns";
import { MobileCard } from "@/components/mobile/MobileCard";
import { Badge } from "@/components/ui/badge";
import { Clock, Edit, Check, X } from "lucide-react";
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
    const now = new Date();
    const taskDate = task.due_date ? new Date(task.due_date) : null;
    
    if (task.status === 'completed') {
      return "bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-800";
    }
    
    if (!taskDate) return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200";
    
    // Priority takes precedence
    if (task.priority === 'high') {
      return "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800";
    }
    
    if (taskDate < now) {
      return "bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-800";
    } else {
      return "bg-gradient-to-br from-carslead-blue/10 to-blue-50 border-carslead-blue/20 text-carslead-darkgray";
    }
  };

  return (
    <div
      className="transition-all duration-200"
      onClick={() => onTaskClick(task)}
      dir="rtl"
    >
      <MobileCard className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 min-h-[100px] rounded-2xl border-2 shadow-md hover:scale-[1.02] active:scale-[0.98]",
        getTaskTypeColor(task),
        task.status === 'completed' && "opacity-70"
      )}>
        <div className="p-5 space-y-4">
          {/* Header section with title and date/time */}
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-semibold text-lg flex-1 leading-relaxed text-right",
              task.status === 'completed' && "line-through"
            )}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mr-3">
              {showDate && task.due_date && (
                <div className="text-sm text-carslead-darkgray flex-shrink-0 bg-white/90 px-3 py-2 rounded-xl font-semibold shadow-sm">
                  <div className="text-xs text-carslead-purple text-center font-bold">
                    {format(new Date(task.due_date), "dd/MM")}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-carslead-darkgray bg-white/90 px-3 py-2 rounded-xl shadow-sm">
                <Clock className="h-4 w-4 text-carslead-purple" />
                <span className="font-semibold text-sm">
                  {task.due_date && format(new Date(task.due_date), "HH:mm")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-base text-carslead-darkgray line-clamp-2 leading-relaxed text-right">
              {task.description}
            </p>
          )}
          
          {/* Footer with badges and actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-white/90 rounded-xl border-carslead-purple/30 text-carslead-purple font-semibold">
                {task.type === 'call' ? 'שיחה' : 
                 task.type === 'meeting' ? 'פגישה' : 
                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm px-3 py-1 bg-white/90 rounded-xl font-semibold",
                  task.priority === 'high' ? 'border-red-400 text-red-700' :
                  task.priority === 'medium' ? 'border-yellow-400 text-yellow-700' :
                  'border-green-400 text-green-700'
                )}
              >
                {task.priority === 'high' ? 'גבוהה' : 
                 task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
              </Badge>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => onTaskStatusToggle(task, e)}
                className={cn(
                  "p-3 rounded-full transition-all duration-300 shadow-md hover:scale-110 active:scale-95",
                  task.status === 'completed' 
                    ? "bg-gradient-to-br from-green-100 to-green-200 text-green-700 hover:from-green-200 hover:to-green-300" 
                    : "bg-white text-carslead-purple hover:bg-carslead-purple hover:text-white border border-carslead-purple/30"
                )}
              >
                {task.status === 'completed' ? 
                  <X className="h-5 w-5" /> : 
                  <Check className="h-5 w-5" />
                }
              </button>
              <button
                onClick={(e) => onEditTask(task, e)}
                className="p-3 rounded-full bg-white text-carslead-blue hover:bg-carslead-blue hover:text-white transition-all duration-300 shadow-md border border-carslead-blue/30 hover:scale-110 active:scale-95"
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
