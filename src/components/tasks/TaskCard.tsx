
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, CheckSquare, Clock, Tag, Bell } from "lucide-react";
import { useState } from "react";
import { format, isToday, isPast, isFuture } from "date-fns";

interface TaskCardProps {
  task: any;
  onStatusChange: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
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

  // Determine card color based on due date
  const getCardColorClass = () => {
    if (!task.due_date) return "bg-gray-50 border-gray-200";
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return "bg-red-50 border-red-200 shadow-red-100";
    } else if (isToday(dueDate)) {
      return "bg-yellow-50 border-yellow-200 shadow-yellow-100";
    } else if (isFuture(dueDate)) {
      return "bg-blue-50 border-blue-200 shadow-blue-100";
    }
    
    return "bg-gray-50 border-gray-200";
  };

  const getDateBadgeColor = () => {
    if (!task.due_date) return "bg-gray-500 text-white";
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return "bg-red-500 text-white";
    } else if (isToday(dueDate)) {
      return "bg-yellow-500 text-white";
    } else if (isFuture(dueDate)) {
      return "bg-blue-500 text-white";
    }
    
    return "bg-gray-500 text-white";
  };

  const getDateText = () => {
    if (!task.due_date) return "ללא תאריך";
    
    const dueDate = new Date(task.due_date);
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return "עבר זמן";
    } else if (isToday(dueDate)) {
      return "היום";
    } else if (isFuture(dueDate)) {
      return "עתידי";
    }
    
    return "ללא תאריך";
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${getCardColorClass()} rounded-2xl`} dir="rtl">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-2 flex-1">
            <h3 className="text-lg font-bold text-[#2F3C7E] text-right leading-tight">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 text-right leading-relaxed">{task.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`${getPriorityBadgeColor(task.priority)} font-medium`}>
              {getPriorityText(task.priority)}
            </Badge>
            <Badge className={`${getDateBadgeColor()} font-medium`}>
              {getDateText()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-right">
            <span className="font-medium">
              {task.due_date ? format(new Date(task.due_date), "dd/MM/yyyy") : "ללא תאריך"}
            </span>
            <Calendar className="h-4 w-4 text-[#2F3C7E]" />
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="font-medium">
              {task.due_date ? format(new Date(task.due_date), "HH:mm") : "ללא שעה"}
            </span>
            <Clock className="h-4 w-4 text-[#2F3C7E]" />
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="font-medium">{getTaskTypeText(task.type)}</span>
            <Tag className="h-4 w-4 text-[#2F3C7E]" />
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="font-medium">{getStatusText(task.status)}</span>
            <CheckSquare className="h-4 w-4 text-[#2F3C7E]" />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4">
        <Button 
          variant={task.status === "completed" ? "default" : "outline"}
          className={`flex-1 rounded-xl font-medium ${task.status === "completed" ? "bg-[#4CAF50] hover:bg-[#4CAF50]/90" : "border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white"}`}
          onClick={() => onStatusChange(task.id, task.status !== "completed")}
        >
          <CheckSquare className="h-4 w-4 ml-2" />
          {task.status === "completed" ? "הושלם" : "סמן כהושלם"}
        </Button>
        
        <Button 
          variant="outline"
          className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white rounded-xl"
          onClick={() => {
            // Add reminder functionality here
            console.log("Setting reminder for task:", task.id);
          }}
        >
          <Bell className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="destructive" 
          className="rounded-xl"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          מחק
        </Button>
      </CardFooter>
    </Card>
  );
}

function getPriorityBadgeColor(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-500 hover:bg-red-600 text-white";
    case "medium":
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    case "low":
      return "bg-green-500 hover:bg-green-600 text-white";
    default:
      return "bg-gray-500 hover:bg-gray-600 text-white";
  }
}

function getPriorityText(priority: string) {
  switch (priority) {
    case "high":
      return "גבוהה";
    case "medium":
      return "בינונית";
    case "low":
      return "נמוכה";
    default:
      return "לא ידוע";
  }
}

function getTaskTypeText(type: string | null | undefined) {
  if (!type) return 'משימה';
  
  switch(type.toLowerCase()) {
    case 'call': return 'שיחת טלפון';
    case 'meeting': return 'פגישה';
    case 'follow_up': return 'מעקב';
    case 'task': 
    default: return 'משימה';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'ממתין';
    case 'in_progress':
      return 'בביצוע';
    case 'completed':
      return 'הושלם';
    case 'cancelled':
      return 'בוטל';
    default:
      return status;
  }
}
