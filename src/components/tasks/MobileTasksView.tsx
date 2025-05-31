
import { MobileContainer } from "@/components/mobile/MobileContainer";
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
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  console.log('MobileTasksView rendering:', { 
    tasks: tasks?.length || 0, 
    filteredTasks: filteredTasks?.length || 0,
    viewMode,
    isLoading,
    showAddDialog
  });

  const handleAddTaskClick = () => {
    console.log('MobileTasksView - Add task button clicked');
    setShowAddDialog(true);
  };

  const handleAddTaskSuccess = () => {
    console.log('MobileTasksView - Task added successfully');
    setShowAddDialog(false);
  };

  const handleDialogChange = (open: boolean) => {
    console.log('MobileTasksView - Dialog state change:', open);
    setShowAddDialog(open);
  };

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
          <button
            onClick={() => onViewModeChange("calendar")}
            className={`
              flex-1 h-10 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors touch-manipulation
              ${viewMode === "calendar" 
                ? "bg-[#2F3C7E] text-white" 
                : "bg-white border-2 border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"
              }
            `}
          >
            <Calendar className="h-4 w-4" />
            יומן
          </button>
          <button
            onClick={() => onViewModeChange("cards")}
            className={`
              flex-1 h-10 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors touch-manipulation
              ${viewMode === "cards" 
                ? "bg-[#2F3C7E] text-white" 
                : "bg-white border-2 border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"
              }
            `}
          >
            <Grid className="h-4 w-4" />
            כרטיסים
          </button>
        </div>

        {/* Content based on view mode */}
        <div className="min-h-screen">
          {viewMode === "cards" && (
            <>
              {/* Add Task Button for Cards View */}
              <div className="mb-4">
                <AddTaskDialog 
                  open={showAddDialog}
                  onOpenChange={handleDialogChange}
                  onSuccess={handleAddTaskSuccess}
                >
                  <button
                    onClick={handleAddTaskClick}
                    className="w-full h-14 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white rounded-2xl font-semibold text-lg shadow-lg flex items-center justify-center gap-3 touch-manipulation active:scale-95 transition-transform"
                  >
                    + הוסף משימה חדשה
                  </button>
                </AddTaskDialog>
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
    </MobileContainer>
  );
}
