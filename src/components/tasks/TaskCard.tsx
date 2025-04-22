
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, CheckSquare, Clock, Tag } from "lucide-react";
import { useState } from "react";

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

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 backdrop-blur-sm bg-white/90">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
          <Badge className={getPriorityBadgeColor(task.priority)}>
            {getPriorityText(task.priority)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(task.due_date).toLocaleDateString("he-IL")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{task.type || "משימה"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{task.status}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Button 
          variant={task.status === "completed" ? "default" : "outline"}
          className="flex-1"
          onClick={() => onStatusChange(task.id, task.status !== "completed")}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          {task.status === "completed" ? "הושלם" : "סמן כהושלם"}
        </Button>
        <Button 
          variant="destructive" 
          className="flex-1"
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
      return "bg-red-500 hover:bg-red-600";
    case "medium":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "low":
      return "bg-green-500 hover:bg-green-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
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
