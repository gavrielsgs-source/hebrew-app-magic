
import { TaskItem } from "./task-list/TaskItem";
import { type Task } from "@/types/task";

interface TasksTableProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: string, isCompleted: boolean) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TasksTable({ tasks, onTaskStatusChange, onTaskDelete }: TasksTableProps) {
  const handleStatusChange = async (taskId: string, isCompleted: boolean) => {
    onTaskStatusChange(taskId, isCompleted);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden" dir="rtl">
      {/* Table Header */}
      <div className="bg-gray-50 border-b p-4">
        <div className="grid grid-cols-9 gap-4 items-center text-right font-medium text-gray-700">
          <div className="text-center">סטטוס</div>
          <div>כותרת</div>
          <div className="text-center">סוג</div>
          <div className="text-center">עדיפות</div>
          <div className="text-center">תאריך יעד</div>
          <div className="text-center">סטטוס משימה</div>
          <div className="text-center">קשור ל</div>
          <div className="text-center">פעולות</div>
        </div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>אין משימות להצגה</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={onTaskDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
