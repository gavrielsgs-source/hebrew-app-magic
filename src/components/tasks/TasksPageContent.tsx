
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskNotifications } from "./TaskNotifications";
import { TasksErrorState } from "./TasksErrorState";
import { TasksLoadingState } from "./TasksLoadingState";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTasksView } from "./MobileTasksView";
import { DesktopTasksView } from "./DesktopTasksView";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "cards";

export function TasksPageContent() {
  const { tasks = [], isLoading, error, refetch, updateTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const isMobile = useIsMobile();

  // Update filtered tasks when tasks change
  useEffect(() => {
    if (tasks) {
      setFilteredTasks(tasks);
    }
  }, [tasks]);

  console.log('TasksPageContent rendering:', { 
    tasksLength: tasks?.length || 0, 
    isLoading, 
    error: !!error, 
    isMobile,
    viewMode
  });

  const handleTaskStatusChange = async (taskId: string, isCompleted: boolean) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          status: isCompleted ? 'completed' : 'pending'
        }
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: updates
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowNotifications(true);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  const handleTasksFilter = (filtered: Task[]) => {
    setFilteredTasks(filtered);
  };

  if (error) {
    return <TasksErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <TasksLoadingState />;
  }

  return (
    <div className="w-full min-h-screen">
      {isMobile ? (
        <MobileTasksView
          tasks={tasks || []}
          filteredTasks={filteredTasks || []}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
          onTaskClick={handleTaskClick}
          onTasksFilter={handleTasksFilter}
        />
      ) : (
        <DesktopTasksView
          tasks={tasks || []}
          filteredTasks={filteredTasks || []}
          viewMode={viewMode as "calendar" | "table" | "cards"}
          onViewModeChange={(mode) => setViewMode(mode as ViewMode)}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          onTasksFilter={handleTasksFilter}
        />
      )}

      {/* Task Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent>
          {selectedTask && (
            <TaskNotifications
              task={selectedTask}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
