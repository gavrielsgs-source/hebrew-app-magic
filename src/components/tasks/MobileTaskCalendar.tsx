
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

  const getTasksForToday = () => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), new Date());
    });
  };

  const getUpcomingTasks = () => {
    return tasks
      .filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        return taskDate > new Date() && !isSameDay(taskDate, new Date());
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 10);
  };

  const handleTaskStatusToggle = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskStatusChange) {
      const newStatus = task.status === 'completed';
      onTaskStatusChange(task.id, !newStatus);
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
    <div className="space-y-6 pb-safe">
      <MobileTaskCalendarHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        todayCount={todayTasks.length}
        upcomingCount={upcomingTasks.length}
        onAddTask={() => setShowAddDialog(true)}
      />

      <MobileTaskCalendarSection
        viewMode={viewMode}
        tasks={viewMode === "today" ? todayTasks : upcomingTasks}
        onTaskClick={onTaskClick}
        onTaskStatusToggle={handleTaskStatusToggle}
        onEditTask={handleEditTask}
      />

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
