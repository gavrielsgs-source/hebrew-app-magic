
import { useState } from "react";
import { isSameDay } from "date-fns";
import { type Task } from "@/types/task";
import { EditTaskDialog } from "./EditTaskDialog";
import { MobileTaskCalendarSection } from "./calendar/MobileTaskCalendarSection";

interface MobileTaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, isCompleted: boolean) => void;
}

export function MobileTaskCalendar({ tasks, onTaskClick, onTaskStatusChange }: MobileTaskCalendarProps) {
  const [viewMode, setViewMode] = useState<"today" | "upcoming">("today");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Helper function to safely filter tasks
  const getTasksForToday = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      if (!task || !task.due_date) return false;
      try {
        return isSameDay(new Date(task.due_date), new Date());
      } catch (error) {
        console.error("Error checking task date:", error);
        return false;
      }
    });
  };

  const getUpcomingTasks = () => {
    if (!tasks || !Array.isArray(tasks)) return [];
    return tasks
      .filter(task => {
        if (!task || !task.due_date) return false;
        try {
          const taskDate = new Date(task.due_date);
          return taskDate > new Date() && !isSameDay(taskDate, new Date());
        } catch (error) {
          console.error("Error checking task date:", error);
          return false;
        }
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 10);
  };

  const handleTaskStatusToggle = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskStatusChange && task) {
      const newStatus = task.status !== 'completed';
      onTaskStatusChange(task.id, newStatus);
    }
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setShowEditDialog(true);
  };

  const todayTasks = getTasksForToday();
  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="space-y-6 pb-safe" dir="rtl">
      {/* View Mode Toggle - No duplicate header */}
      <div className="flex gap-3 p-1.5 bg-muted/50 rounded-2xl border-2 border-border/30">
        <button
          onClick={() => setViewMode("today")}
          className={`flex-1 h-11 text-sm font-semibold rounded-xl transition-all duration-200 ${
            viewMode === "today"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
          }`}
        >
          היום ({todayTasks.length})
        </button>
        <button
          onClick={() => setViewMode("upcoming")}
          className={`flex-1 h-11 text-sm font-semibold rounded-xl transition-all duration-200 ${
            viewMode === "upcoming"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-background/80"
          }`}
        >
          קרובים ({upcomingTasks.length})
        </button>
      </div>

      {/* Main content section */}
      <div>
        <MobileTaskCalendarSection
          viewMode={viewMode}
          tasks={viewMode === "today" ? todayTasks : upcomingTasks}
          onTaskClick={onTaskClick}
          onTaskStatusToggle={handleTaskStatusToggle}
          onEditTask={handleEditTask}
        />
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog 
          task={editingTask}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </div>
  );
}
