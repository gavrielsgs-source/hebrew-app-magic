
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { TasksHeader } from "./task-list/TasksHeader";
import { TaskFilters } from "./task-list/TaskFilters";
import { TaskItem } from "./task-list/TaskItem";
import { TaskCard } from "./TaskCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw, Plus, CheckSquare } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type SortField = "due_date" | "priority" | "title" | "status" | "type";
type SortDirection = "asc" | "desc";

export function TasksTable() {
  const isMobile = useIsMobile();
  const { tasks = [], isLoading, error, refetch, updateTask, deleteTask } = useTasks();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const allTypes = Array.from(new Set((tasks || []).map(task => task.type || 'task')));
  const allStatuses = Array.from(new Set((tasks || []).map(task => task.status || 'pending')));

  const filteredAndSortedTasks = [...(tasks || [])]
    .filter(task => {
      if (statusFilter.length > 0 && !statusFilter.includes(task.status || 'pending')) {
        return false;
      }
      if (typeFilter.length > 0 && !typeFilter.includes(task.type || 'task')) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortField === "due_date") {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return sortDirection === "asc" ? 1 : -1;
        if (!b.due_date) return sortDirection === "asc" ? -1 : 1;
        
        const dateA = new Date(a.due_date).getTime();
        const dateB = new Date(b.due_date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (sortField === "priority") {
        const priorityOrder = { "high": 2, "medium": 1, "low": 0 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        return sortDirection === "asc" ? priorityA - priorityB : priorityB - priorityA;
      }
      
      const valueA = (a[sortField] || "").toString().toLowerCase();
      const valueB = (b[sortField] || "").toString().toLowerCase();
      
      return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });

  if (error) {
    return (
      <div className="space-y-6">
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
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2F3C7E]">ניהול משימות</h2>
        
        <div className="flex space-x-3 rtl:space-x-reverse">
          <TaskFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            allStatuses={allStatuses}
            allTypes={allTypes}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
          />
          
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

      {filteredAndSortedTasks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">אין משימות להצגה</p>
              <p className="text-sm text-gray-500">הוסף משימה חדשה כדי להתחיל</p>
            </div>
          </div>
        </div>
      ) : isMobile ? (
        <div className="grid gap-4">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleTaskStatusChange}
              onDelete={(id) => deleteTask.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <TasksHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleToggleSort}
          />
          <div>
            {filteredAndSortedTasks.map((task, index) => (
              <div key={task.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                <TaskItem
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
