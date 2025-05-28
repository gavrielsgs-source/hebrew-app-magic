
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TasksTable } from "./TasksTable";
import { TaskCalendar } from "./TaskCalendar";
import { TaskNotifications } from "./TaskNotifications";
import { TasksPageHeader } from "./TasksPageHeader";
import { TasksErrorState } from "./TasksErrorState";
import { TasksLoadingState } from "./TasksLoadingState";
import { TasksCardsView } from "./TasksCardsView";
import { AddTaskDialog } from "./AddTaskDialog";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Calendar, List, Grid } from "lucide-react";
import { TaskFiltersAndSearch } from "./TaskFiltersAndSearch";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "table" | "cards";

export function TasksPage() {
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

  if (isMobile) {
    return (
      <MobileContainer>
        <MobileHeader 
          title="ניהול משימות"
          subtitle={`${tasks.length} משימות פעילות`}
        />
        
        {/* Mobile Filters and Search */}
        <TaskFiltersAndSearch 
          tasks={tasks}
          onTasksFilter={handleTasksFilter}
        />
        
        {/* Mobile View Mode Selector */}
        <div className="flex gap-2 mb-6">
          <MobileButton
            variant={viewMode === "calendar" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            icon={<Calendar className="h-4 w-4" />}
            className="flex-1"
          >
            יומן
          </MobileButton>
          <MobileButton
            variant={viewMode === "cards" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
            icon={<Grid className="h-4 w-4" />}
            className="flex-1"
          >
            כרטיסים
          </MobileButton>
          <MobileButton
            variant={viewMode === "table" ? "primary" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
            icon={<List className="h-4 w-4" />}
            className="flex-1"
          >
            טבלה
          </MobileButton>
        </div>

        {/* Content based on view mode */}
        {viewMode === "cards" && (
          <TasksCardsView 
            tasks={filteredTasks}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskDelete={handleTaskDelete}
          />
        )}

        {viewMode === "calendar" && (
          <TaskCalendar 
            tasks={filteredTasks} 
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
          />
        )}

        {viewMode === "table" && (
          <TasksTable 
            tasks={filteredTasks}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskDelete={handleTaskDelete}
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
      </MobileContainer>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <TasksPageHeader 
        viewMode={viewMode} 
        onViewModeChange={setViewMode} 
      />

      {/* Desktop Filters and Search */}
      <TaskFiltersAndSearch 
        tasks={tasks}
        onTasksFilter={handleTasksFilter}
      />

      {viewMode === "cards" && (
        <TasksCardsView 
          tasks={filteredTasks}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
        />
      )}

      {viewMode === "calendar" && (
        <TaskCalendar 
          tasks={filteredTasks} 
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {viewMode === "table" && (
        <TasksTable 
          tasks={filteredTasks}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
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
    </div>
  );
}
