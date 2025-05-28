
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";
import { type Task } from "@/types/task";

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
}

export function CalendarView({ tasks, selectedDate, onSelectedDateChange }: CalendarViewProps) {
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), date);
    });
  };

  return (
    <div className="space-y-6">
      {/* Larger calendar with better spacing */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onSelectedDateChange(date)}
          className="rounded-md border-0 scale-110"
          modifiers={{
            hasTask: (date) => getTasksForDate(date).length > 0
          }}
          modifiersStyles={{
            hasTask: {
              backgroundColor: "#EBF8FF",
              color: "#2B6CB0",
              fontWeight: "bold",
              border: "2px solid #3182CE"
            }
          }}
        />
      </div>
      <div className="flex justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-200 border-2 border-yellow-300"></div>
          משימות להיום
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-200 border-2 border-red-300"></div>
          משימות שעברו
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-200 border-2 border-blue-300"></div>
          משימות עתידיות
        </div>
      </div>
    </div>
  );
}
