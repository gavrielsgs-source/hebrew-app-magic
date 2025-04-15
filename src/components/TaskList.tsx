
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TaskForm } from "./tasks/TaskForm";

interface TaskListProps {
  extended?: boolean;
}

export function TaskList({ extended = false }: TaskListProps) {
  const { tasks, isLoading, updateTask } = useTasks();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  
  // סינון משימות להיום אם לא מוצג במצב מורחב
  const today = new Date().toISOString().split('T')[0];
  
  const filteredTasks = tasks
    .filter(task => {
      if (extended) return true;
      
      // אם משימה היא להיום או בעבר ועדיין לא הושלמה
      const taskDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
      return (taskDate <= today && task.status !== 'completed') || !task.due_date;
    })
    .slice(0, extended ? tasks.length : 5);
  
  const handleTaskStatusChange = async (taskId: string, isCompleted: boolean) => {
    await updateTask.mutateAsync({
      id: taskId,
      data: {
        status: isCompleted ? 'completed' : 'pending'
      }
    });
  };
  
  const getTaskTypeLabel = (type: string | null) => {
    if (!type) return 'משימה';
    
    switch(type) {
      case 'call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'follow_up': return 'מעקב';
      case 'task': 
      default: return 'משימה';
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
                  {task.due_date ? format(new Date(task.due_date), 'HH:mm') : 'ללא שעה'}
                </span>
                <span className="mx-2 text-muted-foreground">•</span>
                <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {task.due_date ? format(new Date(task.due_date), 'dd/MM/yyyy') : 'ללא תאריך'}
                </span>
              </div>
            </div>
            <div>
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {getTaskTypeLabel(task.priority)}
              </Badge>
            </div>
          </div>
        ))
      )}
      
      <Sheet open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="w-full" size="sm">
            {extended ? "הוסף משימה חדשה" : "הצג את כל המשימות"}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>הוסף משימה חדשה</SheetTitle>
          </SheetHeader>
          <TaskForm onSuccess={() => setIsAddTaskOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
