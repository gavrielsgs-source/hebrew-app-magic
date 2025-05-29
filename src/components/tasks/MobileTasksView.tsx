
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Calendar, List, Grid } from "lucide-react";
import { TaskFiltersAndSearch } from "./TaskFiltersAndSearch";
import { TasksCardsView } from "./TasksCardsView";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
import { TasksTable } from "./TasksTable";
import { type Task } from "@/types/task";

type ViewMode = "calendar" | "table" | "cards";

interface MobileTasksViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onTaskStatusChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskClick: (task: Task) => void;
  onTasksFilter: (filtered: Task[]) => void;
}

export function MobileTasksView({
  tasks,
  filteredTasks,
  viewMode,
  onViewModeChange,
  onTaskStatusChange,
  onTaskDelete,
  onTaskClick,
  onTasksFilter
}: MobileTasksViewProps) {
  return (
    <MobileContainer>
      <MobileHeader 
        title="ניהול משימות"
        subtitle={`${tasks.length} משימות פעילות`}
      />
      
      {/* Mobile Filters and Search */}
      <TaskFiltersAndSearch 
        tasks={tasks}
        onTasksFilter={onTasksFilter}
      />
      
      {/* Mobile View Mode Selector */}
      <div className="flex gap-2 mb-6">
        <MobileButton
          variant={viewMode === "calendar" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("calendar")}
          icon={<Calendar className="h-4 w-4" />}
          className="flex-1"
        >
          יומן
        </MobileButton>
        <MobileButton
          variant={viewMode === "cards" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("cards")}
          icon={<Grid className="h-4 w-4" />}
          className="flex-1"
        >
          כרטיסים
        </MobileButton>
        <MobileButton
          variant={viewMode === "table" ? "primary" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("table")}
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
          onTaskStatusChange={onTaskStatusChange}
          onTaskDelete={onTaskDelete}
        />
      )}

      {viewMode === "calendar" && (
        <MobileTaskCalendar 
          tasks={filteredTasks} 
          onTaskClick={onTaskClick}
          onTaskStatusChange={onTaskStatusChange}
        />
      )}

      {viewMode === "table" && (
        <TasksTable 
          tasks={filteredTasks}
          onTaskStatusChange={onTaskStatusChange}
          onTaskDelete={onTaskDelete}
        />
      )}
    </MobileContainer>
  );
}
