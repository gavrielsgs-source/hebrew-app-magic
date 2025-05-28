
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle,
  X,
  Phone,
  Users,
  ClipboardList,
  BarChart3
} from "lucide-react";
import { type Task } from "@/types/task";
import { AddTaskDialog } from "../AddTaskDialog";
import { EditTaskDialog } from "../EditTaskDialog";
import { cn } from "@/lib/utils";

interface DetailedDayViewProps {
  selectedDate: Date;
  tasks: Task[];
  onClose: () => void;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
}

export function DetailedDayView({ 
  selectedDate, 
  tasks, 
  onClose, 
  onTaskClick,
  onTaskUpdate,
  onTaskDelete 
}: DetailedDayViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const dayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return isSameDay(new Date(task.due_date), selectedDate);
  });

  const getTaskTypeIcon = (task: Task) => {
    switch (task.type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'follow_up': return <BarChart3 className="h-4 w-4" />;
      default: return <ClipboardList className="h-4 w-4" />;
    }
  };

  const getTaskTypeColor = (task: Task) => {
    const now = new Date();
    const taskDate = task.due_date ? new Date(task.due_date) : null;
    
    if (task.status === 'completed') {
      return "bg-green-100 border-green-300 text-green-800";
    }
    
    if (!taskDate) return "bg-gray-100 border-gray-300 text-gray-800";
    
    // Priority takes precedence for visual importance
    if (task.priority === 'high') {
      return "bg-red-100 border-red-400 text-red-900";
    }
    
    if (taskDate < now) {
      return "bg-orange-100 border-orange-300 text-orange-800";
    }
    
    switch (task.type) {
      case 'call': return "bg-blue-100 border-blue-300 text-blue-800";
      case 'meeting': return "bg-purple-100 border-purple-300 text-purple-800";
      case 'follow_up': return "bg-yellow-100 border-yellow-300 text-yellow-800";
      default: return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return 'לא צוין';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'call': return 'שיחת טלפון';
      case 'meeting': return 'פגישה';
      case 'follow_up': return 'מעקב';
      case 'task': return 'משימה';
      default: return 'משימה';
    }
  };

  const handleTaskStatusToggle = async (task: Task) => {
    if (!onTaskUpdate) return;
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await onTaskUpdate(task.id, { status: newStatus });
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (onTaskDelete && confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
      onTaskDelete(taskId);
    }
  };

  const completedTasks = dayTasks.filter(task => task.status === 'completed');
  const pendingTasks = dayTasks.filter(task => task.status !== 'completed');

  return (
    <Card className="w-full h-full flex flex-col shadow-lg border-2">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#2F3C7E]" />
            <CardTitle className="text-xl font-bold text-[#2F3C7E]">
              {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: he })}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Day Statistics */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{dayTasks.length}</div>
            <div className="text-sm text-blue-600">סה"כ משימות</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-green-600">הושלמו</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
            <div className="text-sm text-orange-600">ממתינות</div>
          </div>
        </div>

        <Button 
          onClick={() => setShowAddDialog(true)}
          className="w-full mt-4 bg-[#2F3C7E] hover:bg-[#2F3C7E]/90"
        >
          <Plus className="h-4 w-4 ml-2" />
          הוסף משימה חדשה
        </Button>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {dayTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">אין משימות מתוכננות</p>
              <p className="text-sm">לחץ על "הוסף משימה חדשה" כדי להתחיל</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Circle className="h-4 w-4 text-orange-500" />
                    משימות ממתינות ({pendingTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingTasks.map(task => (
                      <div
                        key={task.id}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all",
                          getTaskTypeColor(task)
                        )}
                        onClick={() => onTaskClick?.(task)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            {getTaskTypeIcon(task)}
                            <h4 className="font-medium truncate">{task.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeText(task.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusToggle(task);
                              }}
                              className="h-8 w-8 p-0 hover:bg-green-100"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-100"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm opacity-75 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4">
                            {task.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(task.due_date), 'HH:mm')}
                              </div>
                            )}
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                task.priority === 'high' && "border-red-400 text-red-700",
                                task.priority === 'medium' && "border-yellow-400 text-yellow-700",
                                task.priority === 'low' && "border-green-400 text-green-700"
                              )}
                            >
                              {getPriorityText(task.priority)}
                            </Badge>
                          </div>
                          {(task.leads?.name || task.cars?.make) && (
                            <div className="text-xs text-gray-600">
                              {task.leads?.name && `ליד: ${task.leads.name}`}
                              {task.cars?.make && `רכב: ${task.cars.make} ${task.cars.model || ''}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <>
                  {pendingTasks.length > 0 && <Separator className="my-6" />}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      משימות שהושלמו ({completedTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {completedTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-4 rounded-lg border bg-green-50 border-green-200 opacity-75"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              {getTaskTypeIcon(task)}
                              <h4 className="font-medium line-through">{task.title}</h4>
                              <Badge variant="outline" className="text-xs bg-green-100">
                                הושלם
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTaskStatusToggle(task)}
                              className="h-8 w-8 p-0 hover:bg-green-200"
                            >
                              <Circle className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                          
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-green-700">
                              <Clock className="h-3 w-3" />
                              {format(new Date(task.due_date), 'HH:mm')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Add Task Dialog */}
      <AddTaskDialog 
        key={`add-${selectedDate.toISOString()}`}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        initialDate={selectedDate}
        onSuccess={() => setShowAddDialog(false)}
      />

      {/* Edit Task Dialog */}
      {selectedTask && (
        <EditTaskDialog 
          task={selectedTask}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
    </Card>
  );
}
