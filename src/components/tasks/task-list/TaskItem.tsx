
import { format, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Clock, UserRound, Trash2 } from "lucide-react";
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
    if (!priority) return "bg-gray-100 text-gray-700 border-gray-200";
    
    switch(priority) {
      case 'high': return "bg-red-100 text-red-700 border-red-200";
      case 'medium': return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'low': return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch(status) {
      case 'completed': return "bg-green-100 text-green-700 border-green-200";
      case 'in_progress': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'cancelled': return "bg-red-100 text-red-700 border-red-200";
      case 'pending':
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
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
    <TableRow 
      key={task.id} 
      className={cn(
        "hover:bg-blue-50/50 transition-colors border-b border-gray-50",
        task.status === 'completed' && "bg-gray-50/80"
      )}
    >
      <TableCell className="py-4 px-6">
        <Checkbox 
          checked={task.status === 'completed'} 
          onCheckedChange={(checked) => onStatusChange(task.id, checked as boolean)}
          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />
      </TableCell>
      <TableCell className={cn(
        "text-right py-4 px-6",
        task.status === 'completed' && "line-through text-muted-foreground"
      )}>
        <div className="font-medium text-[#2F3C7E]">{task.title}</div>
      </TableCell>
      <TableCell className="py-4 px-6">
        <Badge variant="outline" className="flex items-center gap-1 flex-row-reverse bg-blue-50 text-blue-700 border-blue-200">
          {getTaskTypeIcon(task.type)}
          {getTaskTypeLabel(task.type)}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-6">
        <Badge className={`${getTaskPriorityColor(task.priority)} border font-medium`}>
          {task.priority === 'high' ? 'גבוהה' : 
           task.priority === 'medium' ? 'בינונית' : 
           task.priority === 'low' ? 'נמוכה' : 
           task.priority}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-6">
        {task.due_date ? (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 flex-row-reverse">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {safeFormatDate(task.due_date, 'dd/MM/yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-row-reverse">
              <Clock className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-600">
                {safeFormatDate(task.due_date, 'HH:mm')}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm text-right block">ללא תאריך</span>
        )}
      </TableCell>
      <TableCell className="py-4 px-6">
        <Badge className={`${getStatusColor(task.status)} border font-medium`}>
          {task.status === 'pending' ? 'ממתין' : 
           task.status === 'in_progress' ? 'בביצוע' : 
           task.status === 'completed' ? 'הושלם' : 
           task.status === 'cancelled' ? 'בוטל' : task.status}
        </Badge>
      </TableCell>
      <TableCell className="py-4 px-6">
        <div className="flex flex-col gap-1">
          {task.car_id && (
            <Badge variant="secondary" className="flex items-center gap-1 flex-row-reverse bg-purple-100 text-purple-700 border-purple-200">
              <Car className="h-3 w-3" />
              <span className="text-xs">{task.cars?.make} {task.cars?.model}</span>
            </Badge>
          )}
          {task.lead_id && (
            <Badge variant="secondary" className="flex items-center gap-1 flex-row-reverse bg-blue-100 text-blue-700 border-blue-200">
              <UserRound className="h-3 w-3" />
              <span className="text-xs">{task.leads?.name}</span>
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4 px-6">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
