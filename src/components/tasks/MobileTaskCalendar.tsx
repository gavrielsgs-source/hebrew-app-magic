
import { useState } from "react";
import { isSameDay } from "date-fns";
import { type Task } from "@/types/task";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { MobileTaskCalendarSection } from "./calendar/MobileTaskCalendarSection";

interface MobileTaskCalendarProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskStatusChange?: (taskId: string, isCompleted: boolean) => void;
}

export function MobileTaskCalendar({ tasks, onTaskClick, onTaskStatusChange }: MobileTaskCalendarProps) {
  const [viewMode, setViewMode] = useState<"today" | "upcoming">("today");
  const [showAddDialog, setShowAddDialog] = useState(false);
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
      {/* Enhanced header with view mode toggle and single add button */}
      <div className="px-4 pt-4 space-y-4">
        {/* Main header with brand gradient background */}
        <div className="bg-gradient-to-r from-carslead-purple to-carslead-blue rounded-xl p-4 shadow-lg">
          <h1 className="text-lg font-semibold text-white mb-1 text-right">
            ניהול משימות
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

      {/* Single Floating Action Button for Adding Tasks */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => setShowAddDialog(true)}
          className="rounded-full shadow-lg px-6 py-3 border-2 border-white bg-gradient-to-r from-carslead-purple to-carslead-blue hover:from-carslead-purple/90 hover:to-carslead-blue/90 text-white font-medium text-base flex items-center gap-2 transition-all duration-200 active:scale-95"
        >
          <span className="text-xl">+</span>
          <span>משימה חדשה</span>
        </button>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => setShowAddDialog(false)}
      />

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
