
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock } from "lucide-react";

interface TaskListProps {
  extended?: boolean;
}

interface Task {
  id: string;
  title: string;
  type: string;
  time: string;
  date: string;
  completed: boolean;
}

// נתוני דוגמה עבור משימות
const tasks: Task[] = [
  {
    id: "1",
    title: "שיחת טלפון עם דני כהן",
    type: "שיחת טלפון",
    time: "10:00",
    date: "15/04/2025",
    completed: false,
  },
  {
    id: "2",
    title: "פגישה עם משפחת לוי לגבי יונדאי i10",
    type: "פגישה",
    time: "12:30",
    date: "15/04/2025",
    completed: false,
  },
  {
    id: "3",
    title: "לשלוח הצעת מחיר למיכל גולן",
    type: "משימה",
    time: "14:00",
    date: "15/04/2025",
    completed: false,
  },
  {
    id: "4",
    title: "לעדכן מלאי סקודה",
    type: "משימה",
    time: "16:00",
    date: "15/04/2025",
    completed: true,
  },
  {
    id: "5",
    title: "מעקב אחרי ליד של יוסי אברהם",
    type: "מעקב",
    time: "17:30",
    date: "15/04/2025",
    completed: false,
  },
  {
    id: "6",
    title: "פרסום רכבים חדשים בפייסבוק",
    type: "משימה",
    time: "09:00",
    date: "16/04/2025",
    completed: false,
  },
  {
    id: "7",
    title: "פגישה עם סוחר מכוניות",
    type: "פגישה",
    time: "11:00",
    date: "16/04/2025",
    completed: false,
  },
];

export function TaskList({ extended = false }: TaskListProps) {
  // סינון משימות להיום אם לא מוצג במצב מורחב
  const filteredTasks = extended ? tasks : tasks.filter(task => task.date === "15/04/2025" && !task.completed).slice(0, 5);
  
  return (
    <div className="space-y-4">
      {filteredTasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center space-x-4 rtl:space-x-reverse rounded-lg border p-4 ${
            task.completed ? "bg-gray-50 dark:bg-gray-800" : ""
          }`}
        >
          <Checkbox id={`task-${task.id}`} checked={task.completed} />
          <div className="flex-1 space-y-1">
            <p className={`text-sm font-medium leading-none ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}>
              {task.title}
            </p>
            <div className="flex items-center pt-2">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{task.time}</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{task.date}</span>
            </div>
          </div>
          <div>
            <Badge 
              variant="outline" 
              className="text-xs"
            >
              {task.type}
            </Badge>
          </div>
        </div>
      ))}
      
      {!extended && (
        <Button variant="ghost" className="w-full" size="sm">
          הצג את כל המשימות
        </Button>
      )}
    </div>
  );
}

// טרם הגדרנו את Badge בקובץ הנפרד
function Badge({ 
  variant = "default",
  className,
  children,
}: { 
  variant?: "default" | "outline"; 
  className?: string;
  children: React.ReactNode;
}) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
  const variantStyles = 
    variant === "default" 
      ? "bg-primary text-primary-foreground" 
      : "border border-input bg-background text-foreground";
  
  return (
    <span className={`${baseStyles} ${variantStyles} ${className || ""}`}>
      {children}
    </span>
  );
}
