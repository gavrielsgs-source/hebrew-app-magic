
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
    <div className="space-y-4" dir="rtl">
      {/* Section header with brand colors */}
      <div className="bg-gradient-to-r from-[#2F3C7E] to-[#4CAF50] rounded-2xl p-5 shadow-lg border border-white/20">
        <h2 className="text-lg font-bold text-white mb-1 text-right">
          {viewMode === "today" ? "משימות להיום" : "משימות קרובות"}
        </h2>
        <p className="text-sm text-white/90 text-right">
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
        <div className="space-y-3">
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
