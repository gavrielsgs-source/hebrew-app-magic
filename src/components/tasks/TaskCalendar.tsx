import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarView } from "./calendar/CalendarView";
import { WeekView } from "./calendar/WeekView";
import { AgendaView } from "./calendar/AgendaView";
import { SelectedDateTasks } from "./calendar/SelectedDateTasks";
import { KeyboardShortcutsHelp } from "./calendar/KeyboardShortcutsHelp";
import { type Task } from "@/types/task";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskCalendar({ tasks, onTaskClick, onTaskUpdate }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "agenda" | "week">("week");
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
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
          <Card className="shadow-sm border-gray-100">
            <CardHeader className="pb-4">
              <CalendarHeader 
                viewMode={viewMode} 
                onViewModeChange={setViewMode} 
              />
            </CardHeader>
            <CardContent>
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

      {/* Keyboard shortcuts help overlay */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="relative">
            <KeyboardShortcutsHelp />
            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-gray-700 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowKeyboardHelp(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <span>?</span>
          <span>קיצורי מקלדת</span>
        </button>
      </div>
    </div>
  );
}
