
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { MobileButton } from "@/components/mobile/MobileButton";
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

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
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
            <MobileButton
              variant="primary"
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "יוצר משימה..." : "צור משימה חדשה"}
            </MobileButton>
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
