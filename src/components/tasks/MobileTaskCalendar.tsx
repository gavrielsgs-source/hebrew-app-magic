
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
    <div className="space-y-6 pb-safe min-h-screen" dir="rtl">
      {/* Clean header with view mode toggle ONLY - NO ADD BUTTONS */}
      <div className="px-4 pt-4 space-y-4">
        {/* Simple header */}
        <div className="bg-gradient-to-r from-carslead-purple to-carslead-blue rounded-xl p-4 shadow-lg">
          <h1 className="text-lg font-semibold text-white mb-1 text-right">
            יומן משימות
          </h1>
          <p className="text-sm text-white/90 text-right">
            {todayTasks.length + upcomingTasks.length} משימות פעילות
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("today")}
            className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all ${
              viewMode === "today"
                ? "bg-gradient-to-r from-carslead-purple to-carslead-blue text-white shadow"
                : "border-2 border-carslead-purple text-carslead-purple hover:bg-carslead-purple hover:text-white bg-white"
            }`}
          >
            היום ({todayTasks.length})
          </button>
          <button
            onClick={() => setViewMode("upcoming")}
            className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all ${
              viewMode === "upcoming"
                ? "bg-gradient-to-r from-carslead-purple to-carslead-blue text-white shadow"
                : "border-2 border-carslead-purple text-carslead-purple hover:bg-carslead-purple hover:text-white bg-white"
            }`}
          >
            קרובים ({upcomingTasks.length})
          </button>
        </div>
      </div>

      {/* Main content section */}
      <div className="px-4">
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
