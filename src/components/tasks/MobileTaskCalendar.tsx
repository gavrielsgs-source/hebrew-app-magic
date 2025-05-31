
import { useState } from "react";
import { isSameDay } from "date-fns";
import { type Task } from "@/types/task";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { MobileTaskCalendarHeader } from "./calendar/MobileTaskCalendarHeader";
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
      {/* Enhanced header with better mobile spacing */}
      <div className="px-6 pt-4">
        <MobileTaskCalendarHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          todayCount={todayTasks.length}
          upcomingCount={upcomingTasks.length}
          onAddTask={() => setShowAddDialog(true)}
        />
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
