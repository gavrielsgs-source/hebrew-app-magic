
import { TasksTable } from "@/components/tasks/TasksTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";

export default function Tasks() {
  const { isLoading, error, refetch } = useTasks();

  return (
    <div className="p-6">
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="text-right">שגיאה בטעינת משימות</AlertTitle>
          <AlertDescription className="flex items-center justify-between text-right">
            <span>לא הצלחנו לטעון את המשימות. ייתכן שחיבור המשתמש פג תוקף.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()} 
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              נסה שנית
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="grid grid-cols-1 gap-6">
        <TasksTable />
      </div>
    </div>
  );
}
