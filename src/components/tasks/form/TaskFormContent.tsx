
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TaskFormContent - Form submitted');
    onSubmit(e);
  };

  const handleButtonClick = () => {
    console.log('TaskFormContent - Submit button clicked');
    onSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className="space-y-6">
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
          {isMobile ? (
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isSubmitting}
              className="w-full h-14 bg-gradient-to-r from-carslead-purple to-carslead-blue text-white rounded-2xl font-semibold text-lg shadow-lg touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "יוצר משימה..." : "צור משימה חדשה"}
            </button>
          ) : (
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-[#2F3C7E] hover:bg-[#2F3C7E]/90 text-white rounded-xl h-12 text-base font-medium"
            >
              {isSubmitting ? "יוצר משימה..." : "צור משימה חדשה"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
