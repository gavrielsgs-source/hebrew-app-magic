
import { TaskItem } from "./task-list/TaskItem";
import { type Task } from "@/types/task";
import { ListTodo } from "lucide-react";

interface TasksTableProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TasksTable({ tasks, onTaskStatusChange, onTaskDelete }: TasksTableProps) {
  const handleStatusChange = async (taskId: string, isCompleted: boolean) => {
    onTaskStatusChange(taskId, isCompleted);
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg border-2 border-border/50 overflow-hidden" dir="rtl">
      {/* Table Header */}
      <div className="bg-muted/50 border-b-2 border-border/50 p-4">
        <div className="grid grid-cols-9 gap-4 items-center text-right font-semibold text-muted-foreground text-sm">
          <div className="text-center">סטטוס</div>
          <div>כותרת</div>
          <div className="text-center">סוג</div>
          <div className="text-center">עדיפות</div>
          <div className="text-center">תאריך יעד</div>
          <div className="text-center">סטטוס משימה</div>
          <div className="text-center">קשור ל</div>
          <div className="text-center">פעולות</div>
        </div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-border/30">
        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <ListTodo className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium text-lg">אין משימות להצגה</p>
            <p className="text-sm text-muted-foreground/70 mt-1">הוסף משימה חדשה כדי להתחיל</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
