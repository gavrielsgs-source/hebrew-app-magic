
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
      case 'test': return 'טסט';
      case 'task': 
      default: return 'משימה';
    }
  };

  const getTaskTypeColor = (taskType: string | null | undefined) => {
    switch(taskType?.toLowerCase()) {
      case 'call': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'meeting': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'follow_up': return "bg-violet-50 text-violet-700 border-violet-200";
      case 'test': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'task':
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTaskPriorityColor = (priority: string | null | undefined) => {
    switch(priority) {
      case 'high': return "bg-red-50 text-red-700 border-red-200";
      case 'medium': return "bg-amber-50 text-amber-700 border-amber-200";
      case 'low': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch(status) {
      case 'completed': return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case 'in_progress': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'cancelled': return "bg-red-50 text-red-700 border-red-200";
      case 'pending':
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getCardBorderColor = () => {
    // Priority takes precedence for visual importance
    if (task.priority === 'high') return "border-r-red-400";
    if (task.priority === 'medium') return "border-r-amber-400";
    if (task.priority === 'low') return "border-r-emerald-400";
    
    // Fall back to type colors
    switch(task.type?.toLowerCase()) {
      case 'call': return "border-r-blue-400";
      case 'meeting': return "border-r-emerald-400";
      case 'follow_up': return "border-r-violet-400";
      default: return "border-r-primary";
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
      "group hover:shadow-xl transition-all duration-300 border-2 border-r-4 rounded-2xl overflow-hidden",
      getCardBorderColor(),
      task.status === 'completed' && "bg-muted/30 opacity-80"
    )} dir="rtl">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-bold text-foreground text-base leading-tight",
              task.status === 'completed' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`${getTaskPriorityColor(task.priority)} border font-semibold text-xs rounded-lg px-2.5 py-0.5`}>
              {task.priority === 'high' ? 'גבוהה' : 
               task.priority === 'medium' ? 'בינונית' : 
               task.priority === 'low' ? 'נמוכה' : 
               task.priority}
            </Badge>
            <Badge className={`${getStatusColor(task.status)} border font-semibold text-xs rounded-lg px-2.5 py-0.5`}>
              {task.status === 'pending' ? 'ממתין' : 
               task.status === 'in_progress' ? 'בביצוע' : 
               task.status === 'completed' ? 'הושלם' : 
               task.status === 'cancelled' ? 'בוטל' : task.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 pb-4">
        <div className="flex items-center justify-between text-sm">
          <Badge className={`${getTaskTypeColor(task.type)} border font-semibold rounded-lg px-2.5 py-0.5`}>
            {getTaskTypeLabel(task.type)}
          </Badge>
          
          {task.due_date && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{safeFormatDate(task.due_date, 'dd/MM/yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{safeFormatDate(task.due_date, 'HH:mm')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Related entities */}
        {(task.car_id || task.lead_id) && (
          <div className="flex flex-wrap gap-2">
            {task.car_id && (
              <Badge variant="secondary" className="flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg px-2.5 py-1">
                <Car className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{task.cars?.make} {task.cars?.model}</span>
              </Badge>
            )}
            {task.lead_id && (
              <Badge variant="secondary" className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2.5 py-1">
                <UserRound className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{task.leads?.name}</span>
              </Badge>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant={task.status === "completed" ? "default" : "outline"}
            className={cn(
              "flex-1 rounded-xl font-semibold h-10 transition-all duration-200",
              task.status === "completed" 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md" 
                : "border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary"
            )}
            onClick={() => onStatusChange(task.id, task.status !== "completed")}
          >
            <CheckSquare className="h-4 w-4 ml-2" />
            {task.status === "completed" ? "הושלם" : "סמן כהושלם"}
          </Button>
          
          <EditTaskDialog task={task} />
          
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-xl h-10 w-10 border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
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
