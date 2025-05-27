
import { Badge } from "@/components/ui/badge";
import { isPast, isToday, isFuture } from "date-fns";
import { type Task } from "@/types/task";

interface TaskCardHeaderProps {
  task: Task;
}

export function TaskCardHeader({ task }: TaskCardHeaderProps) {
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      case "low":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "גבוהה";
      case "medium":
        return "בינונית";
      case "low":
        return "נמוכה";
      default:
        return "לא ידוע";
    }
  };

  const getDateBadgeColor = () => {
    if (!task.due_date) return "bg-gray-500 text-white";
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return "bg-red-500 text-white";
    } else if (isToday(dueDate)) {
      return "bg-yellow-500 text-white";
    } else if (isFuture(dueDate)) {
      return "bg-blue-500 text-white";
    }
    
    return "bg-gray-500 text-white";
  };

  const getDateText = () => {
    if (!task.due_date) return "ללא תאריך";
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return "עבר זמן";
    } else if (isToday(dueDate)) {
      return "היום";
    } else if (isFuture(dueDate)) {
      return "עתידי";
    }
    
    return "ללא תאריך";
  };

  return (
    <div className="flex justify-between items-start gap-3">
      <div className="space-y-2 flex-1">
        <h3 className="text-lg font-bold text-[#2F3C7E] text-right leading-tight">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 text-right leading-relaxed">{task.description}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Badge className={`${getPriorityBadgeColor(task.priority)} font-medium`}>
          {getPriorityText(task.priority)}
        </Badge>
        <Badge className={`${getDateBadgeColor()} font-medium`}>
          {getDateText()}
        </Badge>
      </div>
    </div>
  );
}
