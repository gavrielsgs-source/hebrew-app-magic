
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useSubscription } from '@/contexts/subscription-context';
import { toast } from "sonner";
import { LeadFormBase, FormContextValue } from "./LeadFormBase";
import { LeadFormValues } from "./schemas/lead-form-schema";
import { AddLeadNameField } from "./AddLeadNameField";
import { AddLeadPhoneField } from "./AddLeadPhoneField";
import { AddLeadEmailField } from "./AddLeadEmailField";
import { AddLeadCarField } from "./AddLeadCarField";
import { AddLeadSourceField } from "./AddLeadSourceField";
import { AddLeadAssignedField } from "./AddLeadAssignedField";
import { AddLeadNotesField } from "./AddLeadNotesField";
import { NotificationCheckbox } from "@/components/notifications/NotificationCheckbox";
import { useState } from "react";

export function AddLeadForm({ carId, onSuccess }: { carId?: string; onSuccess?: () => void }) {
  const { user } = useAuth();
  const { leads } = useLeads();
  const { checkEntitlement } = useSubscription();
  const addLead = useCreateLead();
  const { addTask } = useTasks();
  const { cars } = useCars();
  const { scheduleNotification, permission } = usePushNotifications();
  const [shouldScheduleMeeting, setShouldScheduleMeeting] = useState(false);
  const [shouldCreateNotification, setShouldCreateNotification] = useState(false);

  const handleSubmit = async (values: LeadFormValues) => {
    console.log("Starting lead submission with values:", values);
    
    // Check subscription limits before submitting
    const currentLeadCount = leads?.length || 0;
    const canAddLead = checkEntitlement('leadLimit', currentLeadCount + 1);
    
    if (!canAddLead) {
      console.log("Lead creation blocked by subscription limits");
      toast.error("הגעת למגבלת המנוי. לא ניתן להוסיף עוד לקוחות. אנא שדרג את המנוי שלך.");
      return;
    }
    
    try {
      const leadData = {
        name: values.name,
        email: values.email || null,
        phone: values.phone,
        notes: values.notes || null,
        car_id: values.car_id || null,
        source: values.source || "ידני",
        status: "new",
        assigned_to: values.assigned_to || null,
        user_id: user?.id || null
      };

      console.log("Submitting lead data:", leadData);
      const newLead = await addLead.mutateAsync(leadData);
      console.log("Lead created successfully:", newLead);
      
      // If user wants to schedule a meeting, create a task
      if (shouldScheduleMeeting && newLead && newLead[0]) {
        console.log("Creating meeting task for lead:", newLead[0].id);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        
        const taskData = {
          title: `פגישה עם ${values.name}`,
          description: "פגישה ראשונה עם לקוח חדש",
          status: "pending",
          priority: "medium",
          type: "meeting",
          due_date: tomorrow.toISOString(),
          lead_id: newLead[0].id as string,
          car_id: values.car_id || null,
        };

        console.log("Creating task with data:", taskData);
        const newTask = await addTask.mutateAsync(taskData);
        console.log("Task created successfully:", newTask);
        
        // Create notification for the meeting if requested
        if (shouldCreateNotification && newTask && newTask[0]) {
          const reminderTime = new Date(tomorrow.getTime() - 30 * 60 * 1000);
          await scheduleNotification(
            `תזכורת לפגישה עם ${values.name}`,
            `הפגישה מתחילה בעוד 30 דקות`,
            reminderTime,
            "meeting",
            "task",
            newTask[0].id as string
          );
          console.log("Meeting notification scheduled");
        }
      }

      // Create notification for new lead follow-up
      if (shouldCreateNotification && newLead && newLead[0]) {
        const followUpTime = new Date();
        followUpTime.setHours(followUpTime.getHours() + 2); // Follow up in 2 hours
        
        await scheduleNotification(
          `מעקב אחר ליד חדש: ${values.name}`,
          `זמן לטפל בליד החדש של ${values.name}`,
          followUpTime,
          "lead",
          "lead",
          newLead[0].id as string
        );
        console.log("Follow-up notification scheduled");
      }
      
      if (shouldScheduleMeeting) {
        toast.success("הלקוח נוסף בהצלחה ונקבעה פגישה למחר בשעה 10:00");
      } else {
        toast.success("הלקוח נוסף בהצלחה");
      }

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("שגיאה בהוספת לקוח:", error);
      toast.error("אירעה שגיאה בהוספת הלקוח");
    }
  };

  return (
    <LeadFormBase
      defaultValues={{
        name: "",
        email: "",
        phone: "",
        notes: "",
        car_id: carId || "",
        source: "ידני",
        assigned_to: user?.id || ""
      }}
      onSubmit={handleSubmit}
      isSubmitting={addLead.isPending}
    >
      {(context: FormContextValue) => (
        <>
          <AddLeadNameField control={context.form.control} />
          <AddLeadPhoneField control={context.form.control} />
          <AddLeadEmailField control={context.form.control} />
          {!carId && <AddLeadCarField control={context.form.control} cars={cars || []} />}
          <AddLeadSourceField control={context.form.control} />
          {context.canAssignLeads && (
            <AddLeadAssignedField
              control={context.form.control}
              salesAgents={context.salesAgents}
            />
          )}
          <AddLeadNotesField control={context.form.control} />
          
          {/* Schedule Meeting Option */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="schedule-meeting" 
              checked={shouldScheduleMeeting}
              onCheckedChange={(checked) => setShouldScheduleMeeting(checked === true)}
            />
            <label 
              htmlFor="schedule-meeting" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              קבע פגישה למחר בשעה 10:00
            </label>
          </div>

          {/* Notification Option */}
          <NotificationCheckbox
            checked={shouldCreateNotification}
            onCheckedChange={setShouldCreateNotification}
            label={shouldScheduleMeeting ? "צור תזכורת לפגישה ומעקב" : "צור תזכורת למעקב"}
            disabled={permission !== "granted"}
          />
          
          <Button type="submit" className="w-full" disabled={addLead.isPending}>
            {addLead.isPending ? "מוסיף..." : "הוסף ליד"}
          </Button>
        </>
      )}
    </LeadFormBase>
  );
}
