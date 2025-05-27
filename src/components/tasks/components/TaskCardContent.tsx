
import { Calendar, Clock, Tag, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { type Task } from "@/types/task";

interface TaskCardContentProps {
  task: Task;
}

export function TaskCardContent({ task }: TaskCardContentProps) {
  const getTaskTypeText = (type: string | null | undefined) => {
    if (!type) return 'משימה';
    
    switch(type.toLowerCase()) {
      case 'call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'follow_up': return 'מעקב';
      case 'task': 
      default: return 'משימה';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'in_progress':
        return 'בביצוע';
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-center gap-2 text-right">
        <span className="font-medium">
          {task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy") : "ללא תאריך"}
        </span>
        <Calendar className="h-4 w-4 text-[#2F3C7E]" />
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="font-medium">
          {task.due_date ? format(new Date(task.due_date), "HH:mm") : "ללא שעה"}
        </span>
        <Clock className="h-4 w-4 text-[#2F3C7E]" />
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="font-medium">{getTaskTypeText(task.type)}</span>
        <Tag className="h-4 w-4 text-[#2F3C7E]" />
      </div>
      <div className="flex items-center gap-2 text-right">
        <span className="font-medium">{getStatusText(task.status)}</span>
        <CheckSquare className="h-4 w-4 text-[#2F3C7E]" />
      </div>
    </div>
  );
}
