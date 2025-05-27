
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
    <div className="space-y-6">
      {/* Today Tasks */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#2F3C7E] border-b pb-2">
          משימות להיום ({todayTasks.length})
        </h3>
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
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>אין משימות להיום</p>
          </div>
        )}
      </div>

      {/* Past Tasks */}
      {pastTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-600 border-b pb-2">
            משימות שעברו ({pastTasks.length})
          </h3>
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">
            משימות עתידיות ({futureTasks.length})
          </h3>
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
