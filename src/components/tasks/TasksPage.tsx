
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TasksTable } from "./TasksTable";
import { TaskCalendar } from "./TaskCalendar";
import { TaskNotifications } from "./TaskNotifications";
import { TasksPageHeader } from "./TasksPageHeader";
import { TasksErrorState } from "./TasksErrorState";
import { TasksLoadingState } from "./TasksLoadingState";
import { TasksCardsView } from "./TasksCardsView";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent } from "@/components/ui/dialog";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "table" | "cards";

export function TasksPage() {
  const { tasks = [], isLoading, error, refetch, updateTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar"); // Changed back to calendar as default

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowNotifications(true);
  };

  const handleTaskDelete = (taskId: string) => {
    deleteTask.mutate(taskId);
  };

  if (error) {
    return <TasksErrorState onRetry={() => refetch()} />;
  }

  if (isLoading) {
    return <TasksLoadingState />;
  }

  return (
    <div className="space-y-6 p-6">
      <TasksPageHeader 
        viewMode={viewMode} 
        onViewModeChange={setViewMode} 
      />

      {viewMode === "cards" && (
        <TasksCardsView 
          tasks={tasks}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
        />
      )}

      {viewMode === "calendar" && (
        <TaskCalendar tasks={tasks} onTaskClick={handleTaskClick} />
      )}

      {viewMode === "table" && <TasksTable />}

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
    </div>
  );
}
