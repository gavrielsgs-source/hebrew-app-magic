
import { TaskCard } from "./TaskCard";
import { Calendar } from "lucide-react";
import { type Task } from "@/types/task";
import { isToday, isPast, isFuture } from "date-fns";

interface TasksCardsViewProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TasksCardsView({ tasks, onTaskStatusChange, onTaskDelete }: TasksCardsViewProps) {
  const getTasksByDate = () => {
    const todayTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return isToday(new Date(task.due_date));
    });
    
    const pastTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isPast(taskDate) && !isToday(taskDate);
    });
    
    const futureTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return isFuture(new Date(task.due_date));
    });

    return { todayTasks, pastTasks, futureTasks };
  };

  const { todayTasks, pastTasks, futureTasks } = getTasksByDate();

  return (
    <div className="space-y-8">
      {/* Today Tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/20">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            משימות להיום
          </h3>
          <span className="bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full">
            {todayTasks.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onTaskStatusChange}
              onDelete={onTaskDelete}
            />
          ))}
        </div>
        {todayTasks.length === 0 && (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed border-muted-foreground/20">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-3">
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">אין משימות להיום</p>
            <p className="text-sm text-muted-foreground/70 mt-1">כל המשימות הושלמו! 🎉</p>
          </div>
        )}
      </div>

      {/* Past Tasks */}
      {pastTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-destructive/20">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <Calendar className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              משימות שעברו
            </h3>
            <span className="bg-destructive/10 text-destructive text-sm font-semibold px-3 py-1 rounded-full">
              {pastTasks.length}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onTaskStatusChange}
                onDelete={onTaskDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Future Tasks */}
      {futureTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-500/20">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              משימות עתידיות
            </h3>
            <span className="bg-blue-500/10 text-blue-500 text-sm font-semibold px-3 py-1 rounded-full">
              {futureTasks.length}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {futureTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onTaskStatusChange}
                onDelete={onTaskDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
