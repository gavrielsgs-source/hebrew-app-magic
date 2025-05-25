
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TasksTable } from "./TasksTable";
import { TaskCalendar } from "./TaskCalendar";
import { TaskCard } from "./TaskCard";
import { TaskNotifications } from "./TaskNotifications";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Plus, Calendar, List, Grid } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { type Task } from "@/types/task";
import { format, isToday, isPast, isFuture } from "date-fns";

export function TasksPage() {
  const isMobile = useIsMobile();
  const { tasks = [], isLoading, error, refetch, updateTask, deleteTask } = useTasks();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "table" | "cards">("calendar");

  const handleTaskStatusChange = async (taskId: string, isCompleted: boolean) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        data: {
          status: isCompleted ? 'completed' : 'pending'
        }
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowNotifications(true);
  };

  const getTasksByDate = () => {
    const now = new Date();
    const todayTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return isToday(new Date(task.due_date));
    });
    
    const pastTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isPast(taskDate) && !isToday(taskDate);
    });
    
    const futureTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return isFuture(new Date(task.due_date));
    });

    return { todayTasks, pastTasks, futureTasks };
  };

  const { todayTasks, pastTasks, futureTasks } = getTasksByDate();

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#2F3C7E]">ניהול משימות</h2>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2 hover:bg-blue-50"
          >
            <RefreshCcw className="h-4 w-4" />
            נסה שנית
          </Button>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <RefreshCcw className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-red-800 mb-2">לא ניתן לטעון את המשימות</p>
              <p className="text-sm text-red-600">אנא ודא שהנך מחובר ונסה שנית</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2F3C7E]">ניהול משימות</h2>
        
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg p-1 bg-gray-50">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="h-8"
            >
              <Calendar className="h-4 w-4 mr-1" />
              יומן
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="h-8"
            >
              <Grid className="h-4 w-4 mr-1" />
              כרטיסים
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8"
            >
              <List className="h-4 w-4 mr-1" />
              טבלה
            </Button>
          </div>
          
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-[#2F3C7E] to-[#4A5A8C] hover:from-[#1F2C5E] hover:to-[#3A4A7C] text-white shadow-lg">
                <Plus className="ml-2 h-4 w-4" />
                הוסף משימה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>הוסף משימה חדשה</DialogTitle>
              </DialogHeader>
              <TaskForm onSuccess={() => setIsAddTaskOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {viewMode === "calendar" && (
        <TaskCalendar tasks={tasks} onTaskClick={handleTaskClick} />
      )}

      {viewMode === "cards" && (
        <div className="space-y-6">
          {/* Today Tasks */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#2F3C7E] border-b pb-2">
              משימות להיום ({todayTasks.length})
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              ))}
            </div>
            {todayTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>אין משימות להיום</p>
              </div>
            )}
          </div>

          {/* Past Tasks */}
          {pastTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-600 border-b pb-2">
                משימות שעברו ({pastTasks.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                    onDelete={(id) => deleteTask.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Future Tasks */}
          {futureTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">
                משימות עתידיות ({futureTasks.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {futureTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                    onDelete={(id) => deleteTask.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "table" && <TasksTable />}

      {/* Task Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedTask && (
            <TaskNotifications
              task={selectedTask}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
