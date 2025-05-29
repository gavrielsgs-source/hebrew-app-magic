
import { TasksPageHeader } from "./TasksPageHeader";
import { TaskFiltersAndSearch } from "./TaskFiltersAndSearch";
import { TasksCardsView } from "./TasksCardsView";
import { TaskCalendar } from "./TaskCalendar";
import { TasksTable } from "./TasksTable";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "table" | "cards";

interface DesktopTasksViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onTaskStatusChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTasksFilter: (filtered: Task[]) => void;
}

export function DesktopTasksView({
  tasks,
  filteredTasks,
  viewMode,
  onViewModeChange,
  onTaskStatusChange,
  onTaskDelete,
  onTaskClick,
  onTaskUpdate,
  onTasksFilter
}: DesktopTasksViewProps) {
  return (
    <div className="space-y-6 p-6">
      <TasksPageHeader 
        viewMode={viewMode} 
        onViewModeChange={onViewModeChange} 
      />

      {/* Desktop Filters and Search */}
      <TaskFiltersAndSearch 
        tasks={tasks}
        onTasksFilter={onTasksFilter}
      />

      {viewMode === "cards" && (
        <TasksCardsView 
          tasks={filteredTasks}
          onTaskStatusChange={onTaskStatusChange}
          onTaskDelete={onTaskDelete}
        />
      )}

      {viewMode === "calendar" && (
        <TaskCalendar 
          tasks={filteredTasks} 
          onTaskClick={onTaskClick}
          onTaskUpdate={onTaskUpdate}
        />
      )}

      {viewMode === "table" && (
        <TasksTable 
          tasks={filteredTasks}
          onTaskStatusChange={onTaskStatusChange}
          onTaskDelete={onTaskDelete}
        />
      )}
    </div>
  );
}
