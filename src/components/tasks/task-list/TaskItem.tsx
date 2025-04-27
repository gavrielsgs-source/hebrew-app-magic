
import { format, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Clock, UserRound } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, isCompleted: boolean) => Promise<void>;
  onDelete: (taskId: string) => void;
}

export function TaskItem({ task, onStatusChange, onDelete }: TaskItemProps) {
  const getTaskTypeLabel = (taskType: string | null | undefined) => {
    if (!taskType) return 'משימה';
    
    switch(taskType.toLowerCase()) {
      case 'call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'follow_up': return 'מעקב';
      case 'task': 
      default: return 'משימה';
    }
  };

  const getTaskTypeIcon = (taskType: string | null | undefined) => {
    if (!taskType) return <UserRound className="h-4 w-4" />;
    
    switch(taskType.toLowerCase()) {
      case 'call': return <UserRound className="h-4 w-4" />;
      case 'meeting': return <UserRound className="h-4 w-4" />;
      case 'follow_up': return <Calendar className="h-4 w-4" />;
      case 'task': 
      default: return <UserRound className="h-4 w-4" />;
    }
  };

  const getTaskPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return "bg-gray-200 text-gray-800";
    
    switch(priority) {
      case 'high': return "bg-red-100 text-red-800";
      case 'medium': return "bg-yellow-100 text-yellow-800";
      case 'low': return "bg-green-100 text-green-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };
  
  // Safely format a date string
  const safeFormatDate = (dateString: string | null | undefined, formatString: string): string => {
    if (!dateString) return "ללא תאריך";
    
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, formatString) : "תאריך לא תקין";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "תאריך לא תקין";
    }
  };

  return (
    <TableRow key={task.id} className={task.status === 'completed' ? "bg-muted/50" : ""}>
      <TableCell>
        <Checkbox 
          checked={task.status === 'completed'} 
          onCheckedChange={(checked) => onStatusChange(task.id, checked as boolean)}
        />
      </TableCell>
      <TableCell className={cn(
        "text-right",
        task.status === 'completed' && "line-through text-muted-foreground"
      )}>
        {task.title}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="flex items-center gap-1 flex-row-reverse">
          {getTaskTypeIcon(task.type)}
          {getTaskTypeLabel(task.type)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={getTaskPriorityColor(task.priority)}>
          {task.priority === 'high' ? 'גבוהה' : 
           task.priority === 'medium' ? 'בינונית' : 
           task.priority === 'low' ? 'נמוכה' : 
           task.priority}
        </Badge>
      </TableCell>
      <TableCell>
        {task.due_date ? (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 flex-row-reverse">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">
                {safeFormatDate(task.due_date, 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 flex-row-reverse">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs">
                {safeFormatDate(task.due_date, 'HH:mm')}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs text-right block">ללא תאריך</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {task.status === 'pending' ? 'ממתין' : 
           task.status === 'in_progress' ? 'בביצוע' : 
           task.status === 'completed' ? 'הושלם' : 
           task.status === 'cancelled' ? 'בוטל' : task.status}
        </Badge>
      </TableCell>
      <TableCell>
        {task.car_id && (
          <Badge variant="secondary" className="flex items-center gap-1 flex-row-reverse">
            <Car className="h-3 w-3" />
            {task.cars?.make} {task.cars?.model}
          </Badge>
        )}
        {task.lead_id && (
          <Badge variant="secondary" className="flex items-center gap-1 mt-1 flex-row-reverse">
            <UserRound className="h-3 w-3" />
            {task.leads?.name}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDelete(task.id)}
        >
          מחק
        </Button>
      </TableCell>
    </TableRow>
  );
}
