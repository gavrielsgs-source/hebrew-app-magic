
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
      return "bg-green-100 border-green-300 text-green-800";
    }
    
    if (!taskDate) return "bg-gray-100 border-gray-300";
    
    // Priority takes precedence
    if (task.priority === 'high') {
      return "bg-red-100 border-red-300 text-red-800";
    }
    
    if (taskDate < now) {
      return "bg-red-100 border-red-300 text-red-800";
    } else {
      return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  return (
    <div
      className="mobile-transition mobile-touch-target"
      onClick={() => onTaskClick(task)}
    >
      <MobileCard className={cn(
        "cursor-pointer hover:shadow-xl mobile-transition",
        getTaskTypeColor(task),
        task.status === 'completed' && "opacity-70"
      )}>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "font-medium text-base flex-1",
              task.status === 'completed' && "line-through"
            )}>
              {task.title}
            </h4>
            <div className="flex items-center gap-2 mr-3">
              {showDate && task.due_date && (
                <div className="text-sm text-gray-600 flex-shrink-0">
                  <div className="text-xs text-gray-500 text-left">
                    {format(new Date(task.due_date), "dd/MM")}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {task.due_date && format(new Date(task.due_date), "HH:mm")}
              </div>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {task.type === 'call' ? 'שיחה' : 
                 task.type === 'meeting' ? 'פגישה' : 
                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  task.priority === 'high' ? 'border-red-300 text-red-700' :
                  task.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                  'border-green-300 text-green-700'
                )}
              >
                {task.priority === 'high' ? 'עדיפות גבוהה' : 
                 task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={(e) => onTaskStatusToggle(task, e)}
                className={cn(
                  "p-2 rounded-full mobile-touch-target mobile-transition",
                  task.status === 'completed' 
                    ? "bg-green-100 text-green-600 hover:bg-green-200" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {task.status === 'completed' ? 
                  <X className="h-4 w-4" /> : 
                  <Check className="h-4 w-4" />
                }
              </button>
              <button
                onClick={(e) => onEditTask(task, e)}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 mobile-touch-target mobile-transition"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>
  );
}
