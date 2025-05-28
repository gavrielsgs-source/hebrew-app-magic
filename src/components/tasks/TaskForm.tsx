
import { useTasks } from "@/hooks/use-tasks";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/mobile/MobileCard";
import { TaskFormContent } from "./form/TaskFormContent";
import { TaskFormError } from "./form/TaskFormError";
import type { TaskFormProps } from "./form/TaskFormTypes";

export function TaskForm({ onSuccess, initialLeadId, initialCarId }: TaskFormProps) {
  console.log('TaskForm component rendering with props:', { initialLeadId, initialCarId });
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Initialize hooks with comprehensive error handling
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

  const formContent = (
    <TaskFormContent 
      onSuccess={onSuccess}
      initialLeadId={initialLeadId}
      initialCarId={initialCarId}
    />
  );

  if (isMobile) {
    return (
      <MobileCard 
        className="mx-4 my-6" 
        contentClassName="p-6"
        dir="rtl"
        header={
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#2F3C7E] mb-2">משימה חדשה</h2>
            <p className="text-gray-600">צור משימה חדשה ונהל את הזמן שלך</p>
          </div>
        }
      >
        {formContent}
      </MobileCard>
    );
  }

  try {
    return (
      <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm border" dir="rtl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#2F3C7E] mb-2">משימה חדשה</h2>
          <p className="text-gray-600">צור משימה חדשה ונהל את הזמן שלך</p>
        </div>
        {formContent}
      </div>
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
