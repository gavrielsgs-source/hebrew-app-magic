
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Calendar, List, Grid, Plus } from "lucide-react";
import { TaskFiltersAndSearch } from "./TaskFiltersAndSearch";
import { TasksCardsView } from "./TasksCardsView";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
import { TasksTable } from "./TasksTable";
import { AddTaskDialog } from "./AddTaskDialog";
import { type Task } from "@/types/task";
import { useState, useEffect } from "react";

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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  console.log('MobileTasksView rendering:', { 
    tasks: tasks?.length || 0, 
    filteredTasks: filteredTasks?.length || 0,
    viewMode,
    isLoading
  });

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-600">טוען...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="pb-20">
      <MobileHeader 
        title="ניהול משימות"
        subtitle={`${tasks?.length || 0} משימות פעילות`}
      />
      
      {/* Mobile Filters and Search */}
      <TaskFiltersAndSearch 
        tasks={tasks || []}
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
          tasks={filteredTasks || []}
          onTaskStatusChange={onTaskStatusChange}
          onTaskDelete={onTaskDelete}
        />
      )}

      {viewMode === "calendar" && (
        <MobileTaskCalendar 
          tasks={filteredTasks || []} 
          onTaskClick={onTaskClick}
          onTaskStatusChange={onTaskStatusChange}
        />
      )}

      {viewMode === "table" && (
        <TasksTable 
          tasks={filteredTasks || []}
          onTaskStatusChange={onTaskStatusChange}
          onTaskDelete={onTaskDelete}
        />
      )}

      {/* Floating Action Button for Adding Tasks */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
        <MobileButton
          variant="primary"
          size="lg"
          onClick={() => setShowAddDialog(true)}
          icon={<Plus className="h-6 w-6" />}
          className="rounded-full shadow-2xl px-6 py-4 mobile-gradient-primary border-2 border-white"
        >
          משימה חדשה
        </MobileButton>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => setShowAddDialog(false)}
      />
    </MobileContainer>
  );
}
