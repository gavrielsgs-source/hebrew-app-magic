
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { MobileButton } from "@/components/mobile/MobileButton";
import { Calendar, Grid } from "lucide-react";
import { TaskFiltersAndSearch } from "./TaskFiltersAndSearch";
import { TasksCardsView } from "./TasksCardsView";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
import { AddTaskDialog } from "./AddTaskDialog";
import { type Task } from "@/types/task";
import { useState, useEffect } from "react";

type ViewMode = "calendar" | "cards";

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
            <div className="text-base font-medium text-gray-600">טוען...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="pb-20" withPadding={false}>
      {/* Header with brand gradient background */}
      <div className="bg-gradient-to-r from-carslead-purple to-carslead-blue rounded-xl mx-4 mt-4 p-4 shadow-lg">
        <h1 className="text-lg font-semibold text-white mb-1 text-right">
          ניהול משימות
        </h1>
        <p className="text-sm text-white/90 text-right">
          {tasks?.length || 0} משימות פעילות
        </p>
      </div>
      
      {/* Content with proper spacing */}
      <div className="px-4 space-y-4 mt-6">
        {/* Mobile Filters and Search */}
        <TaskFiltersAndSearch 
          tasks={tasks || []}
          onTasksFilter={onTasksFilter}
        />
        
        {/* Mobile View Mode Selector - Only calendar and cards */}
        <div className="flex gap-2">
          <MobileButton
            variant={viewMode === "calendar" ? "primary" : "outline"}
            size="md"
            onClick={() => onViewModeChange("calendar")}
            icon={<Calendar className="h-4 w-4" />}
            className="flex-1 h-10 text-sm font-medium rounded-lg"
          >
            יומן
          </MobileButton>
          <MobileButton
            variant={viewMode === "cards" ? "primary" : "outline"}
            size="md"
            onClick={() => onViewModeChange("cards")}
            icon={<Grid className="h-4 w-4" />}
            className="flex-1 h-10 text-sm font-medium rounded-lg"
          >
            כרטיסים
          </MobileButton>
        </div>

        {/* Content based on view mode */}
        <div className="min-h-screen">
          {viewMode === "cards" && (
            <>
              {/* Add Task Button for Cards View */}
              <div className="mb-4">
                <MobileButton
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddDialog(true)}
                  className="w-full h-12 text-sm font-medium rounded-lg shadow bg-gradient-to-r from-carslead-purple to-carslead-blue hover:from-carslead-purple/90 hover:to-carslead-blue/90"
                >
                  + הוסף משימה חדשה
                </MobileButton>
              </div>
              
              <TasksCardsView 
                tasks={filteredTasks || []}
                onTaskStatusChange={onTaskStatusChange}
                onTaskDelete={onTaskDelete}
              />
            </>
          )}

          {viewMode === "calendar" && (
            <MobileTaskCalendar 
              tasks={filteredTasks || []} 
              onTaskClick={onTaskClick}
              onTaskStatusChange={onTaskStatusChange}
            />
          )}
        </div>
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
