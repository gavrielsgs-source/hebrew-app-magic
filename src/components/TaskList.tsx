
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { format, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TaskListProps {
  extended?: boolean;
}

export function TaskList({ extended = false }: TaskListProps) {
  const { tasks, isLoading, updateTask } = useTasks();
  
  const today = new Date().toISOString().split('T')[0];
  
  const filteredTasks = tasks
    .filter(task => {
      try {
        if (extended) return true;
        
        if (!task.due_date) return true;
        
        const taskDate = new Date(task.due_date);
        if (!isValid(taskDate)) return true;
        
        const taskDateStr = taskDate.toISOString().split('T')[0];
        return (taskDateStr <= today && task.status !== 'completed');
      } catch (error) {
        console.error("Error filtering task:", error);
        return true;
      }
    })
    .slice(0, extended ? tasks.length : 5);
  
  const handleTaskStatusChange = async (taskId: string, isCompleted: boolean) => {
    console.log("TaskList - Updating task status:", { taskId, isCompleted });
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          status: isCompleted ? 'completed' : 'pending'
        }
      });
      console.log("TaskList - Task status updated successfully");
    } catch (error) {
      console.error("TaskList - Error updating task status:", error);
    }
  };
  
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
  
  const safeFormatDate = (dateString: string | null | undefined, formatPattern: string): string => {
    if (!dateString) return "ללא תאריך";
    
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, formatPattern) : "תאריך לא תקין";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "תאריך לא תקין";
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-4">טוען משימות...</div>;
  }
  
  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">
          אין משימות להצגה
        </div>
      ) : (
        filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center space-x-4 rtl:space-x-reverse rounded-lg border p-4 ${
              task.status === 'completed' ? "bg-gray-50 dark:bg-gray-800" : ""
            }`}
          >
            <Checkbox 
              id={`task-${task.id}`} 
              checked={task.status === 'completed'} 
              onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
            />
            <div className="flex-1 space-y-1">
              <p className={`text-sm font-medium leading-none ${
                task.status === 'completed' ? "line-through text-muted-foreground" : ""
              }`}>
                {task.title}
              </p>
              <div className="flex items-center pt-2">
                <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.due_date ? safeFormatDate(task.due_date, 'HH:mm') : 'ללא שעה'}
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.due_date ? safeFormatDate(task.due_date, 'dd/MM/yyyy') : 'ללא תאריך'}
                </span>
              </div>
            </div>
            <div>
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {getTaskTypeLabel(task.type)}
              </Badge>
            </div>
          </div>
        ))
      )}
      
      {!extended && (
        <Button variant="ghost" className="w-full" size="sm">
          הצג את כל המשימות
        </Button>
      )}
    </div>
  );
}
