
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
      className="mobile-transition mobile-touch-target"
      onClick={() => onTaskClick(task)}
    >
      <MobileCard className={cn(
        "cursor-pointer hover:shadow-xl mobile-transition min-h-[120px]",
        getTaskTypeColor(task),
        task.status === 'completed' && "opacity-70"
      )}>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "font-semibold text-lg flex-1 leading-relaxed",
              task.status === 'completed' && "line-through"
            )}>
              {task.title}
            </h4>
            <div className="flex items-center gap-3 mr-4">
              {showDate && task.due_date && (
                <div className="text-base text-gray-700 flex-shrink-0 bg-white/80 px-3 py-1 rounded-lg">
                  <div className="text-sm text-gray-600 text-center">
                    {format(new Date(task.due_date), "dd/MM")}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-base text-gray-700 bg-white/80 px-3 py-1 rounded-lg">
                <Clock className="h-5 w-5" />
                {task.due_date && format(new Date(task.due_date), "HH:mm")}
              </div>
            </div>
          </div>
          
          {task.description && (
            <p className="text-base text-gray-700 line-clamp-2 leading-relaxed">{task.description}</p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex gap-3 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1 bg-white/90">
                {task.type === 'call' ? 'שיחה' : 
                 task.type === 'meeting' ? 'פגישה' : 
                 task.type === 'follow_up' ? 'מעקב' : 'משימה'}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-sm px-3 py-1 bg-white/90",
                  task.priority === 'high' ? 'border-red-400 text-red-700' :
                  task.priority === 'medium' ? 'border-yellow-400 text-yellow-700' :
                  'border-green-400 text-green-700'
                )}
              >
                {task.priority === 'high' ? 'עדיפות גבוהה' : 
                 task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
              </Badge>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={(e) => onTaskStatusToggle(task, e)}
                className={cn(
                  "p-3 rounded-full mobile-touch-target mobile-transition shadow-md",
                  task.status === 'completed' 
                    ? "bg-green-100 text-green-600 hover:bg-green-200" 
                    : "bg-white text-gray-600 hover:bg-gray-100"
                )}
              >
                {task.status === 'completed' ? 
                  <X className="h-6 w-6" /> : 
                  <Check className="h-6 w-6" />
                }
              </button>
              <button
                onClick={(e) => onEditTask(task, e)}
                className="p-3 rounded-full bg-white text-blue-600 hover:bg-blue-50 mobile-touch-target mobile-transition shadow-md"
              >
                <Edit className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </MobileCard>
    </div>
  );
}
