
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Car, UserRound, CheckSquare, Trash2 } from "lucide-react";
import { format, isValid } from "date-fns";
import { useState } from "react";
import { EditTaskDialog } from "./EditTaskDialog";
import { type Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, isCompleted: boolean) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
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

  const getTaskPriorityColor = (priority: string | null | undefined) => {
    if (!priority) return "bg-gray-100 text-gray-700 border-gray-200";
    
    switch(priority) {
      case 'high': return "bg-red-100 text-red-700 border-red-200";
      case 'medium': return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case 'low': return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch(status) {
      case 'completed': return "bg-green-100 text-green-700 border-green-200";
      case 'in_progress': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'cancelled': return "bg-red-100 text-red-700 border-red-200";
      case 'pending':
      default: return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };
  
  const safeFormatDate = (dateString: string | null | undefined, formatString: string): string => {
    if (!dateString) return "ללא תאריך";
    
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, formatString) : "תאריך לא תקין";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "תאריך לא תקין";
    }
  };

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow border-r-4 border-r-[#2F3C7E]",
      task.status === 'completed' && "bg-gray-50/80 opacity-75"
    )} dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-[#2F3C7E] text-lg leading-tight",
              task.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 ml-3">
            <Badge className={`${getTaskPriorityColor(task.priority)} border font-medium text-xs`}>
              {task.priority === 'high' ? 'גבוהה' : 
               task.priority === 'medium' ? 'בינונית' : 
               task.priority === 'low' ? 'נמוכה' : 
               task.priority}
            </Badge>
            <Badge className={`${getStatusColor(task.status)} border font-medium text-xs`}>
              {task.status === 'pending' ? 'ממתין' : 
               task.status === 'in_progress' ? 'בביצוע' : 
               task.status === 'completed' ? 'הושלם' : 
               task.status === 'cancelled' ? 'בוטל' : task.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
            {getTaskTypeLabel(task.type)}
          </Badge>
          
          {task.due_date && (
            <div className="flex items-center gap-3 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{safeFormatDate(task.due_date, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{safeFormatDate(task.due_date, 'HH:mm')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Related entities */}
        {(task.car_id || task.lead_id) && (
          <div className="flex flex-wrap gap-2">
            {task.car_id && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-700 border-purple-200">
                <Car className="h-3 w-3" />
                <span className="text-xs">{task.cars?.make} {task.cars?.model}</span>
              </Badge>
            )}
            {task.lead_id && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700 border-blue-200">
                <UserRound className="h-3 w-3" />
                <span className="text-xs">{task.leads?.name}</span>
              </Badge>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant={task.status === "completed" ? "default" : "outline"}
            className={`flex-1 rounded-xl font-medium ${task.status === "completed" ? "bg-[#4CAF50] hover:bg-[#4CAF50]/90" : "border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"}`}
            onClick={() => onStatusChange(task.id, task.status !== "completed")}
          >
            <CheckSquare className="h-4 w-4 ml-2" />
            {task.status === "completed" ? "הושלם" : "סמן כהושלם"}
          </Button>
          
          <EditTaskDialog task={task} />
          
          <Button 
            variant="destructive" 
            size="sm"
            className="rounded-xl"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
