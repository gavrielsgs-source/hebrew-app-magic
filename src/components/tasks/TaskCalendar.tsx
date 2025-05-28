
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTaskCalendar } from "./MobileTaskCalendar";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarView } from "./calendar/CalendarView";
import { WeekView } from "./calendar/WeekView";
import { AgendaView } from "./calendar/AgendaView";
import { SelectedDateTasks } from "./calendar/SelectedDateTasks";
import { type Task } from "@/types/task";
import { toast } from "sonner";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export function TaskCalendar({ tasks, onTaskClick, onTaskUpdate }: TaskCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "agenda" | "week">("week");
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

  // If mobile, use the mobile calendar component
  if (isMobile) {
    return <MobileTaskCalendar tasks={tasks} onTaskClick={onTaskClick} />;
  }

  return (
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
  );
}
