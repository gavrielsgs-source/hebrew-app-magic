
import { useTasks } from "@/hooks/use-tasks";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";
import { TaskFormContent } from "./form/TaskFormContent";
import { TaskFormError } from "./form/TaskFormError";
import type { TaskFormProps } from "./form/TaskFormTypes";

interface TaskFormPropsWithDate extends TaskFormProps {
  initialDate?: Date | null;
}

export function TaskForm({ 
  onSuccess, 
  initialLeadId, 
  initialCarId, 
  initialDate 
}: TaskFormPropsWithDate) {
  console.log('TaskForm component rendering with props:', { 
    initialLeadId, 
    initialCarId, 
    initialDate,
    onSuccess: !!onSuccess 
  });
  
  const { toast } = useToast();
  
  // Initialize hooks with error handling
  let addTask, scheduleNotification, permission;
  try {
    console.log('Initializing hooks in TaskForm...');
    const tasksHook = useTasks();
    addTask = tasksHook.addTask;
    console.log('useTasks hook initialized successfully');
    
    const pushNotifications = usePushNotifications();
    scheduleNotification = pushNotifications.scheduleNotification;
    permission = pushNotifications.permission;
    console.log('usePushNotifications hook initialized successfully');
  } catch (error) {
    console.error('Critical error initializing hooks in TaskForm:', error);
    toast({
      title: "שגיאה",
      description: "אירעה שגיאה בטעינת טופס המשימה",
      variant: "destructive",
    });
    return (
      <TaskFormError
        title="שגיאה בטעינת הטופס"
        description="אירעה שגיאה בטעינת טופס המשימה"
      />
    );
  }

  try {
    return (
      <TaskFormContent 
        onSuccess={onSuccess}
        initialLeadId={initialLeadId}
        initialCarId={initialCarId}
        initialDate={initialDate}
      />
    );
  } catch (renderError) {
    console.error('Error rendering TaskForm:', renderError);
    return (
      <TaskFormError
        title="שגיאה בהצגת הטופס"
        description="אירעה שגיאה בהצגת טופס המשימה"
      />
    );
  }
}
