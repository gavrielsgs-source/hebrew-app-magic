
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { TasksHeader } from "./task-list/TasksHeader";
import { TaskFilters } from "./task-list/TaskFilters";
import { TaskItem } from "./task-list/TaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCcw } from "lucide-react";

type SortField = "due_date" | "priority" | "title" | "status" | "type";
type SortDirection = "asc" | "desc";

export function TasksTable() {
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

  // Determine task types and statuses for filtering
  const allTypes = Array.from(new Set((tasks || []).map(task => task.type || 'task')));
  const allStatuses = Array.from(new Set((tasks || []).map(task => task.status || 'pending')));

  // Apply filters and sorting
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">ניהול משימות</h2>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            נסה שנית
          </Button>
        </div>
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-2">לא ניתן לטעון את המשימות</p>
          <p className="text-sm text-muted-foreground">אנא ודא שהנך מחובר ונסה שנית</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">ניהול משימות</h2>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">ניהול משימות</h2>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
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
              <Button>הוסף משימה חדשה</Button>
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
        <div className="text-center p-4 text-muted-foreground border rounded-lg">
          אין משימות להצגה
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TasksHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleToggleSort}
            />
            <TableBody>
              {filteredAndSortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onStatusChange={handleTaskStatusChange}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
