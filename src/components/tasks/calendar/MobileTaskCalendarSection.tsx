
import { format } from "date-fns";
import { type Task } from "@/types/task";
import { MobileTaskCalendarCard } from "./MobileTaskCalendarCard";
import { MobileTaskCalendarEmpty } from "./MobileTaskCalendarEmpty";

interface MobileTaskCalendarSectionProps {
  viewMode: "today" | "upcoming";
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusToggle: (task: Task, e: React.MouseEvent) => void;
  onEditTask: (task: Task, e: React.MouseEvent) => void;
}

export function MobileTaskCalendarSection({
  viewMode,
  tasks,
  onTaskClick,
  onTaskStatusToggle,
  onEditTask
}: MobileTaskCalendarSectionProps) {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Section header with better RTL alignment */}
      <div className="text-center py-8">
        <h2 className="text-3xl font-bold text-[#2F3C7E] mb-3 text-right">
          {viewMode === "today" ? "משימות להיום" : "משימות קרובות"}
        </h2>
        <p className="text-xl text-gray-600 text-right">
          {viewMode === "today" 
            ? `${format(new Date(), "dd/MM/yyyy")} - ${tasks.length} משימות`
            : `${tasks.length} משימות עתידיות`
          }
        </p>
      </div>
      
      {/* Tasks list or empty state */}
      {tasks.length === 0 ? (
        <MobileTaskCalendarEmpty viewMode={viewMode} />
      ) : (
        <div className="space-y-6">
          {tasks.map(task => (
            <MobileTaskCalendarCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onTaskStatusToggle={onTaskStatusToggle}
              onEditTask={onEditTask}
              showDate={viewMode === "upcoming"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
