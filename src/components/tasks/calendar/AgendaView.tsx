
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
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
    
    if (!taskDate) return "bg-gray-100 border-gray-300";
    
    if (isSameDay(taskDate, now)) {
      return "bg-yellow-100 border-yellow-300 text-yellow-800";
    } else if (taskDate < now) {
      return "bg-red-100 border-red-300 text-red-800";
    } else {
      return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return isSameDay(new Date(task.due_date), new Date());
  }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  return (
    <div className="space-y-4">
      <div className="text-center py-4 border-b">
        <h3 className="text-xl font-bold text-[#2F3C7E]">
          סדר יום ליום {format(new Date(), "dd/MM/yyyy")}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          המשימות והתזכורות שלך להיום
        </p>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {todayTasks.map(task => (
          <div
            key={task.id}
            className={cn(
              "p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all",
              getTaskTypeColor(task)
            )}
            onClick={() => onTaskClick(task)}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-base mb-2">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(task.due_date!), "HH:mm")}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.type === 'call' ? 'שיחה' : 
                     task.type === 'meeting' ? 'פגישה' : 
                     task.type === 'follow_up' ? 'מעקב' : 'משימה'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {task.priority === 'high' ? 'עדיפות גבוהה' : 
                     task.priority === 'medium' ? 'עדיפות בינונית' : 'עדיפות נמוכה'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {todayTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">אין משימות להיום</p>
            <p className="text-sm">תיהנה מיום פנוי! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
