
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
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
import { useState } from "react";

export function AddLeadForm({ carId }: { carId?: string }) {
  const { user } = useAuth();
  const addLead = useCreateLead();
  const { addTask } = useTasks();
  const { cars } = useCars();
  const [shouldScheduleMeeting, setShouldScheduleMeeting] = useState(false);

  const handleSubmit = async (values: LeadFormValues) => {
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

      const newLead = await addLead.mutateAsync(leadData);
      
      // If user wants to schedule a meeting, create a task
      if (shouldScheduleMeeting && newLead && newLead[0]) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // Default to 10:00 AM tomorrow
        
        const taskData = {
          title: `פגישה עם ${values.name}`,
          description: "פגישה ראשונה עם לקוח חדש",
          status: "pending",
          priority: "medium",
          type: "meeting",
          due_date: tomorrow.toISOString(),
          lead_id: newLead[0].id,
          car_id: values.car_id || null,
        };

        await addTask.mutateAsync(taskData);
        toast.success("הלקוח נוסף בהצלחה ונקבעה פגישה למחר בשעה 10:00");
      } else {
        toast.success("הלקוח נוסף בהצלחה");
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
          
          <Button type="submit" className="w-full" disabled={addLead.isPending}>
            {addLead.isPending ? "מוסיף..." : "הוסף ליד"}
          </Button>
        </>
      )}
    </LeadFormBase>
  );
}
