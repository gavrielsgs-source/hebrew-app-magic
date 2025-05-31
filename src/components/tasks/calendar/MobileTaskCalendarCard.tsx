
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
      return "bg-green-50 border-green-200 text-green-800";
    }
    
    if (!taskDate) return "bg-gray-50 border-gray-200";
    
    // Priority takes precedence
    if (task.priority === 'high') {
      return "bg-red-50 border-red-200 text-red-800";
    }
    
    if (taskDate < now) {
      return "bg-red-50 border-red-200 text-red-800";
    } else {
      return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div
      className="mobile-transition mobile-large-touch-target"
      onClick={() => onTaskClick(task)}
      dir="rtl"
    >
      <MobileCard className={cn(
        "cursor-pointer hover:shadow-xl mobile-transition min-h-[140px] rounded-3xl",
        getTaskTypeColor(task),
        task.status === 'completed' && "opacity-70"
      )}>
        <div className="p-8 space-y-6">
          {/* Header section with title and date/time */}
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-bold text-2xl flex-1 leading-relaxed text-right",
              task.status === 'completed' && "line-through"
            )}>
              {task.title}
            </h3>
            <div className="flex items-center gap-4 mr-6">
              {showDate && task.due_date && (
                <div className="text-lg text-gray-700 flex-shrink-0 bg-white/90 px-4 py-2 rounded-2xl">
                  <div className="text-base text-gray-600 text-center font-medium">
                    {format(new Date(task.due_date), "dd/MM")}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-lg text-gray-700 bg-white/90 px-4 py-2 rounded-2xl">
                <Clock className="h-6 w-6" />
                <span className="font-medium">
                  {task.due_date && format(new Date(task.due_date), "HH:mm")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <p className="text-lg text-gray-700 line-clamp-2 leading-relaxed text-right">
              {task.description}
            </p>
          )}
          
          {/* Footer with badges and actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4 flex-wrap">
              <Badge variant="outline" className="text-base px-4 py-2 bg-white/90 rounded-2xl">
                {task.type === 'call' ? 'שיחה' : 
                 task.type === 'meeting' ? 'פגישה' : 
                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-base px-4 py-2 bg-white/90 rounded-2xl",
                  task.priority === 'high' ? 'border-red-400 text-red-700' :
                  task.priority === 'medium' ? 'border-yellow-400 text-yellow-700' :
                  'border-green-400 text-green-700'
                )}
              >
                {task.priority === 'high' ? 'עדיפות גבוהה' : 
                 task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
              </Badge>
            </div>
            
            {/* Action buttons with larger touch targets */}
            <div className="flex gap-4">
              <button
                onClick={(e) => onTaskStatusToggle(task, e)}
                className={cn(
                  "p-4 rounded-full mobile-large-touch-target mobile-transition shadow-lg",
                  task.status === 'completed' 
                    ? "bg-green-100 text-green-600 hover:bg-green-200" 
                    : "bg-white text-gray-600 hover:bg-gray-100"
                )}
              >
                {task.status === 'completed' ? 
                  <X className="h-8 w-8" /> : 
                  <Check className="h-8 w-8" />
                }
              </button>
              <button
                onClick={(e) => onEditTask(task, e)}
                className="p-4 rounded-full bg-white text-blue-600 hover:bg-blue-50 mobile-large-touch-target mobile-transition shadow-lg"
              >
                <Edit className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>
  );
}
