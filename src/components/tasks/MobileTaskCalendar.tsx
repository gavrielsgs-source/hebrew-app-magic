
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
      {/* Clean header with view mode toggle */}
      <div className="px-4 pt-4 space-y-4">
        {/* Clean header */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h1 className="text-lg font-semibold text-[#2F3C7E] mb-1 text-right">
            יומן משימות
          </h1>
          <p className="text-sm text-gray-600 text-right">
            {todayTasks.length + upcomingTasks.length} משימות פעילות
          </p>
        </div>

        {/* Clean View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("today")}
            className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all border-2 ${
              viewMode === "today"
                ? "bg-[#2F3C7E] text-white border-[#2F3C7E] shadow"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#2F3C7E] hover:text-[#2F3C7E] bg-white"
            }`}
          >
            היום ({todayTasks.length})
          </button>
          <button
            onClick={() => setViewMode("upcoming")}
            className={`flex-1 h-10 text-sm font-medium rounded-lg transition-all border-2 ${
              viewMode === "upcoming"
                ? "bg-[#2F3C7E] text-white border-[#2F3C7E] shadow"
                : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#2F3C7E] hover:text-[#2F3C7E] bg-white"
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
