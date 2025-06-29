
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
    if (task.status === 'completed') {
      return "bg-white border-gray-200 text-gray-600";
    }
    
    const now = new Date();
    const taskDate = task.due_date ? new Date(task.due_date) : null;
    
    if (!taskDate) return "bg-white border-gray-200";
    
    // Priority takes precedence
    if (task.priority === 'high') {
      return "bg-white border-red-200 text-red-700";
    }
    
    if (taskDate < now) {
      return "bg-white border-red-200 text-red-700";
    } else {
      return "bg-white border-gray-200 text-gray-700";
    }
  };

  return (
    <div
      className="transition-all duration-200"
      onClick={() => onTaskClick(task)}
      dir="rtl"
    >
      <MobileCard className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-300 min-h-[100px] rounded-2xl border-2 shadow-sm hover:scale-[1.01] active:scale-[0.99]",
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
                <div className="text-sm text-gray-600 flex-shrink-0 bg-gray-50 px-3 py-2 rounded-xl font-semibold shadow-sm border border-gray-100">
                  <div className="text-xs text-[#2F3C7E] text-center font-bold">
                    {format(new Date(task.due_date), "dd/MM")}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-semibold text-sm">
                  {task.due_date && format(new Date(task.due_date), "HH:mm")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-base text-gray-600 line-clamp-2 leading-relaxed text-right">
              {task.description}
            </p>
          )}
          
          {/* Footer with badges and actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-gray-50 rounded-xl border-gray-300 text-gray-600 font-semibold">
                {task.type === 'call' ? 'שיחה' : 
                 task.type === 'meeting' ? 'פגישה' : 
                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm px-3 py-1 bg-gray-50 rounded-xl font-semibold",
                  task.priority === 'high' ? 'border-red-300 text-red-600' :
                  task.priority === 'medium' ? 'border-yellow-300 text-yellow-600' :
                  'border-green-300 text-green-600'
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
                  "p-3 rounded-full transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 border-2",
                  task.status === 'completed' 
                    ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border-gray-300"
                )}
              >
                {task.status === 'completed' ? 
                  <X className="h-5 w-5" /> : 
                  <Check className="h-5 w-5" />
                }
              </button>
              <button
                onClick={(e) => onEditTask(task, e)}
                className="p-3 rounded-full bg-white text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow-sm border-2 border-gray-300 hover:scale-110 active:scale-95"
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
