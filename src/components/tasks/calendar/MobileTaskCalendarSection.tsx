
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
    <div className="space-y-4">
      <div className="text-center py-4">
        <h3 className="text-xl font-bold text-[#2F3C7E] mb-1">
          {viewMode === "today" ? "משימות להיום" : "משימות קרובות"}
        </h3>
        <p className="text-sm text-gray-600">
          {viewMode === "today" 
            ? `${format(new Date(), "dd/MM/yyyy")} - ${tasks.length} משימות`
            : `${tasks.length} משימות עתידיות`
          }
        </p>
      </div>
      
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
