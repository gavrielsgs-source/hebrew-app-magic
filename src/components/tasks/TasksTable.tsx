
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Car, Clock, Filter, MoveDown, MoveUp, Phone, User, UserRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortField = "due_date" | "priority" | "title" | "status" | "type";
type SortDirection = "asc" | "desc";

export function TasksTable() {
  const { tasks, isLoading, updateTask, deleteTask } = useTasks();
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
    await updateTask.mutateAsync({
      id: taskId,
      data: {
        status: isCompleted ? 'completed' : 'pending'
      }
    });
  };

  const getTaskTypeLabel = (taskType: string | null | undefined) => {
    if (!taskType) return 'משימה';
    
    switch(taskType.toLowerCase()) {
      case 'call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'follow_up': return 'מעקב';
      case 'task': 
      default: return 'משימה';
    }
  };

  const getTaskTypeIcon = (taskType: string | null | undefined) => {
    if (!taskType) return <UserRound className="h-4 w-4" />;
    
    switch(taskType.toLowerCase()) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <User className="h-4 w-4" />;
      case 'follow_up': return <Calendar className="h-4 w-4" />;
      case 'task': 
      default: return <UserRound className="h-4 w-4" />;
    }
  };

  const getTaskPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return "bg-gray-200 text-gray-800";
    
    switch(priority) {
      case 'high': return "bg-red-100 text-red-800";
      case 'medium': return "bg-yellow-100 text-yellow-800";
      case 'low': return "bg-green-100 text-green-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const allTypes = Array.from(new Set(tasks.map(task => task.type || 'task')));
  const allStatuses = Array.from(new Set(tasks.map(task => task.status || 'pending')));

  // Apply filters and sorting
  const filteredAndSortedTasks = [...tasks]
    .filter(task => {
      // Filter by status if statusFilter has selections
      if (statusFilter.length > 0 && !statusFilter.includes(task.status || 'pending')) {
        return false;
      }
      
      // Filter by type if typeFilter has selections
      if (typeFilter.length > 0 && !typeFilter.includes(task.type || 'task')) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortField === "due_date") {
        // Handle null or undefined due dates
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
      
      // Default string comparison for other fields
      const valueA = (a[sortField] || "").toString().toLowerCase();
      const valueB = (b[sortField] || "").toString().toLowerCase();
      
      if (sortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

  if (isLoading) {
    return <div className="text-center p-4">טוען משימות...</div>;
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" ? (
      <MoveUp className="h-4 w-4 ml-1" />
    ) : (
      <MoveDown className="h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">ניהול משימות</h2>
        
        <div className="flex space-x-2 rtl:space-x-reverse">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                סטטוס
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allStatuses.map(status => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setStatusFilter([...statusFilter, status]);
                    } else {
                      setStatusFilter(statusFilter.filter(s => s !== status));
                    }
                  }}
                >
                  {status === 'pending' ? 'ממתין' : 
                   status === 'in_progress' ? 'בביצוע' : 
                   status === 'completed' ? 'הושלם' : 
                   status === 'cancelled' ? 'בוטל' : status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                סוג
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allTypes.map(type => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={typeFilter.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTypeFilter([...typeFilter, type]);
                    } else {
                      setTypeFilter(typeFilter.filter(t => t !== type));
                    }
                  }}
                >
                  {getTaskTypeLabel(type)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
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
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleToggleSort("title")}
                >
                  <div className="flex items-center">
                    כותרת {renderSortIcon("title")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleToggleSort("type")}
                >
                  <div className="flex items-center">
                    סוג {renderSortIcon("type")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleToggleSort("priority")}
                >
                  <div className="flex items-center">
                    עדיפות {renderSortIcon("priority")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleToggleSort("due_date")}
                >
                  <div className="flex items-center">
                    תאריך {renderSortIcon("due_date")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleToggleSort("status")}
                >
                  <div className="flex items-center">
                    סטטוס {renderSortIcon("status")}
                  </div>
                </TableHead>
                <TableHead>קשור ל</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTasks.map((task) => (
                <TableRow key={task.id} className={task.status === 'completed' ? "bg-muted/50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={task.status === 'completed'} 
                      onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className={task.status === 'completed' ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTaskTypeIcon(task.type)}
                      {getTaskTypeLabel(task.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTaskPriorityColor(task.priority)}>
                      {task.priority === 'high' ? 'גבוהה' : 
                       task.priority === 'medium' ? 'בינונית' : 
                       task.priority === 'low' ? 'נמוכה' : 
                       task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {format(new Date(task.due_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">
                            {format(new Date(task.due_date), 'HH:mm')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">ללא תאריך</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {task.status === 'pending' ? 'ממתין' : 
                       task.status === 'in_progress' ? 'בביצוע' : 
                       task.status === 'completed' ? 'הושלם' : 
                       task.status === 'cancelled' ? 'בוטל' : task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.car_id && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {task.cars?.make} {task.cars?.model}
                      </Badge>
                    )}
                    {task.lead_id && (
                      <Badge variant="secondary" className="flex items-center gap-1 mt-1">
                        <UserRound className="h-3 w-3" />
                        {task.leads?.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteTask.mutate(task.id)}
                      disabled={deleteTask.isPending}
                    >
                      מחק
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
