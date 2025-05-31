
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { NotificationCheckbox } from "@/components/notifications/NotificationCheckbox";
import { TaskBasicDetails } from "./TaskBasicDetails";
import { TaskDateAndStatus } from "./TaskDateAndStatus";
import { TaskTypeAndPriority } from "./TaskTypeAndPriority";
import { TaskRelations } from "./TaskRelations";
import { useTaskForm } from "./useTaskForm";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TaskFormProps } from "./TaskFormTypes";

export function TaskFormContent(props: TaskFormProps) {
  const isMobile = useIsMobile();
  const {
    form,
    isSubmitting,
    shouldCreateNotification,
    setShouldCreateNotification,
    selectedNotificationOptions,
    setSelectedNotificationOptions,
    permission,
    onSubmit,
  } = useTaskForm(props);

  const watchedDueDate = form.watch("due_date");

  console.log('TaskFormContent render:', { 
    isMobile, 
    isSubmitting, 
    watchedDueDate: !!watchedDueDate,
    formValid: form.formState.isValid
  });

  // Enhanced mobile-first submit handler
  const handleSubmit = (e?: React.FormEvent | React.TouchEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('TaskFormContent - Form submitted');
    
    // Ensure immediate response on mobile
    requestAnimationFrame(() => {
      onSubmit();
    });
  };

  // Enhanced mobile button click handler
  const handleButtonClick = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('TaskFormContent - Submit button clicked/touched');
    handleSubmit(e);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <TaskBasicDetails />
        <TaskDateAndStatus />
        <TaskTypeAndPriority />
        <TaskRelations />
        
        {/* Notification Option */}
        {watchedDueDate && (
          <NotificationCheckbox
            checked={shouldCreateNotification}
            onCheckedChange={setShouldCreateNotification}
            label="צור תזכורות למשימה"
            disabled={permission !== "granted"}
            showOptions={true}
            selectedOptions={selectedNotificationOptions}
            onOptionsChange={setSelectedNotificationOptions}
          />
        )}
        
        <div className="flex gap-3 pt-6">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            onClick={handleButtonClick}
            onTouchStart={handleButtonClick}
            className={`w-full ${isMobile ? 'h-14 text-lg min-h-[56px]' : 'h-10 text-sm'} bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 active:bg-[#2F3C7E]/80 text-white rounded-xl font-medium transition-colors`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            {isSubmitting ? "יוצר משימה..." : "צור משימה חדשה"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
