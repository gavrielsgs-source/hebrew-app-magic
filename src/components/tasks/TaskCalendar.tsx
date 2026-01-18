import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarView } from "./calendar/CalendarView";
import { WeekView } from "./calendar/WeekView";
import { AgendaView } from "./calendar/AgendaView";
import { SelectedDateTasks } from "./calendar/SelectedDateTasks";
import { KeyboardShortcutsHelp } from "./calendar/KeyboardShortcutsHelp";
import { AddTaskDialog } from "./AddTaskDialog";
import { type Task } from "@/types/task";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { Keyboard, X } from "lucide-react";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskCalendar({ tasks, onTaskClick, onTaskUpdate }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "agenda" | "week">("week");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [taskCreationDate, setTaskCreationDate] = useState<Date | null>(null);
  const isMobile = useIsMobile();

  const handleTaskDateChange = async (taskId: string, newDate: Date) => {
    if (!onTaskUpdate) return;
    
    try {
      await onTaskUpdate(taskId, {
        due_date: newDate.toISOString()
      });
      toast.success("תאריך המשימה עודכן בהצלחה");
    } catch (error) {
      console.error("Failed to update task date:", error);
      toast.error("שגיאה בעדכון תאריך המשימה");
    }
  };

  const handleCreateTask = (date: Date) => {
    setTaskCreationDate(date);
    setShowAddTaskDialog(true);
  };

  const handleAddTaskSuccess = () => {
    setShowAddTaskDialog(false);
    setTaskCreationDate(null);
  };

  const handleNavigateTime = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
    } else if (viewMode === 'calendar') {
      setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
    } else {
      // For agenda view, navigate by day
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    }
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  const handleToggleHelp = () => {
    setShowKeyboardHelp(!showKeyboardHelp);
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onViewModeChange: setViewMode,
    onNavigateTime: handleNavigateTime,
    onGoToToday: handleGoToToday,
    onToggleHelp: handleToggleHelp
  });

  // If mobile, use the mobile calendar component
  if (isMobile) {
    return <MobileTaskCalendar tasks={tasks} onTaskClick={onTaskClick} />;
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar View - Now takes more space */}
        <div className="xl:col-span-3">
          <Card className="shadow-lg border-2 border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-l from-primary/5 to-transparent">
              <CalendarHeader 
                viewMode={viewMode} 
                onViewModeChange={setViewMode} 
              />
            </CardHeader>
            <CardContent className="p-6">
              {viewMode === "week" ? (
                <WeekView
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onSelectedDateChange={setSelectedDate}
                  onTaskClick={onTaskClick}
                  onTaskDateChange={handleTaskDateChange}
                />
              ) : viewMode === "calendar" ? (
                <CalendarView
                  tasks={tasks}
                  selectedDate={selectedDate}
                  onSelectedDateChange={setSelectedDate}
                  onTaskClick={onTaskClick}
                  onTaskDateChange={handleTaskDateChange}
                  onCreateTask={handleCreateTask}
                />
              ) : (
                <AgendaView
                  tasks={tasks}
                  onTaskClick={onTaskClick}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Tasks - Now takes less space */}
        <div className="xl:col-span-1">
          <SelectedDateTasks
            tasks={tasks}
            selectedDate={selectedDate}
            onTaskClick={onTaskClick}
          />
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog 
        key={taskCreationDate?.toISOString()} 
        onSuccess={handleAddTaskSuccess}
        initialDate={taskCreationDate}
      />

      {/* Keyboard shortcuts help overlay */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative">
            <KeyboardShortcutsHelp />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardHelp(false)}
              className="absolute -top-3 -right-3 h-8 w-8 bg-card text-foreground rounded-full shadow-lg hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setShowKeyboardHelp(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-lg"
        >
          <Keyboard className="h-4 w-4" />
          <span>קיצורי מקלדת</span>
        </Button>
      </div>
    </div>
  );
}
