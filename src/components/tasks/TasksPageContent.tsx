
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskNotifications } from "./TaskNotifications";
import { TasksErrorState } from "./TasksErrorState";
import { TasksLoadingState } from "./TasksLoadingState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTasksView } from "./MobileTasksView";
import { DesktopTasksView } from "./DesktopTasksView";
import { EditTaskDialog } from "./EditTaskDialog";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "cards";

export function TasksPageContent() {
  const { tasks = [], isLoading, error, refetch, updateTask, deleteTask } = useTasks();
  const [selectedTask] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (tasks) {
      setFilteredTasks(tasks);
    }
  }, [tasks]);

  const handleTaskStatusChange = async (taskId: string, isCompleted: boolean) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: { status: isCompleted ? 'completed' : 'pending' }
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: updates });
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  // לחיצה בודדת על משימה ביומן – פותחת את חלון פרטי המשימה המלא
  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
  };

  // לחיצה כפולה – פותחת את אותו חלון פרטים מלא (לפי בקשת המשתמש)
  const handleTaskDoubleClick = (task: Task) => {
    setEditingTask(task);
    setShowEditDialog(true);
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
          onTaskDoubleClick={handleTaskDoubleClick}
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
          onTaskDoubleClick={handleTaskDoubleClick}
          onTaskUpdate={handleTaskUpdate}
          onTasksFilter={handleTasksFilter}
        />
      )}

      {/* דיאלוג פרטי המשימה המלא – נפתח מלחיצה ביומן */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={showEditDialog}
          onOpenChange={(open) => {
            setShowEditDialog(open);
            if (!open) setEditingTask(null);
          }}
        />
      )}

      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent aria-describedby="task-notifications-description">
          <DialogHeader>
            <DialogTitle>התראות משימה</DialogTitle>
            <DialogDescription id="task-notifications-description">
              נהל התראות עבור המשימה הנבחרת
            </DialogDescription>
          </DialogHeader>
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
