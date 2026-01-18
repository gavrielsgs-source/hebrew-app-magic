
import { MobileContainer } from "@/components/mobile/MobileContainer";
import { Calendar, Grid } from "lucide-react";
import { TaskFiltersAndSearch } from "./TaskFiltersAndSearch";
import { TasksCardsView } from "./TasksCardsView";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  console.log('MobileTasksView rendering:', { 
    tasks: tasks?.length || 0, 
    filteredTasks: filteredTasks?.length || 0,
    viewMode,
    isLoading
  });

  const handleViewModeChange = (mode: ViewMode, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('MobileTasksView - View mode change to:', mode);
    requestAnimationFrame(() => {
      onViewModeChange(mode);
    });
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-base font-medium text-muted-foreground">טוען...</div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer className="pb-32" withPadding={false}>
      {/* Clean Header */}
      <div className="bg-card rounded-2xl mx-4 mt-4 p-5 shadow-lg border-2 border-border/50">
        <h1 className="text-xl font-bold text-foreground mb-1.5 text-right">
          ניהול משימות
        </h1>
        <p className="text-sm text-muted-foreground text-right">
          {tasks?.length || 0} משימות פעילות
        </p>
      </div>
      
      {/* Content with proper spacing */}
      <div className="px-4 space-y-5 mt-6">
        {/* Mobile Filters and Search */}
        <TaskFiltersAndSearch 
          tasks={tasks || []}
          onTasksFilter={onTasksFilter}
        />
        
        {/* Clean View Mode Selector */}
        <div className="flex gap-3 p-1.5 bg-muted/50 rounded-2xl border-2 border-border/30">
          <button
            type="button"
            onClick={(e) => handleViewModeChange("calendar", e)}
            onTouchStart={(e) => handleViewModeChange("calendar", e)}
            className={`
              flex-1 h-12 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 min-h-[48px]
              ${viewMode === "calendar" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
              }
            `}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            <Calendar className="h-4 w-4" />
            יומן
          </button>
          <button
            type="button"
            onClick={(e) => handleViewModeChange("cards", e)}
            onTouchStart={(e) => handleViewModeChange("cards", e)}
            className={`
              flex-1 h-12 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 min-h-[48px]
              ${viewMode === "cards" 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
              }
            `}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            <Grid className="h-4 w-4" />
            כרטיסים
          </button>
        </div>

        {/* Content based on view mode */}
        <div className="min-h-screen">
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
        </div>
      </div>
    </MobileContainer>
  );
}
