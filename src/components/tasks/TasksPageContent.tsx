
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskNotifications } from "./TaskNotifications";
import { TasksErrorState } from "./TasksErrorState";
import { TasksLoadingState } from "./TasksLoadingState";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTasksView } from "./MobileTasksView";
import { DesktopTasksView } from "./DesktopTasksView";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "table" | "cards";

export function TasksPageContent() {
  const { tasks = [], isLoading, error, refetch, updateTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);
  const isMobile = useIsMobile();

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
    <>
      {isMobile ? (
        <MobileTasksView
          tasks={tasks}
          filteredTasks={filteredTasks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
          onTaskClick={handleTaskClick}
          onTasksFilter={handleTasksFilter}
        />
      ) : (
        <DesktopTasksView
          tasks={tasks}
          filteredTasks={filteredTasks}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          onTasksFilter={handleTasksFilter}
        />
      )}

      {/* Task Notifications SwipeDialog */}
      <SwipeDialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedTask && (
            <TaskNotifications
              task={selectedTask}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </DialogContent>
      </SwipeDialog>
    </>
  );
}
