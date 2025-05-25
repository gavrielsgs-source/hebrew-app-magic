
import { Button } from "@/components/ui/button";
import { useLeads, useUpdateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { LeadFormBase, FormContextValue } from "./LeadFormBase";
import { LeadFormValues } from "./schemas/lead-form-schema";
import { EditLeadNameField } from "./fields/EditLeadNameField";
import { EditLeadPhoneField } from "./fields/EditLeadPhoneField";
import { EditLeadEmailField } from "./fields/EditLeadEmailField";
import { EditLeadCarField } from "./fields/EditLeadCarField";
import { EditLeadStatusField } from "./fields/EditLeadStatusField";
import { EditLeadSourceField } from "./fields/EditLeadSourceField";
import { EditLeadAssignedField } from "./fields/EditLeadAssignedField";
import { EditLeadNotesField } from "./fields/EditLeadNotesField";

interface EditLeadFormProps {
  lead: any;
  onSuccess?: () => void;
}

export function EditLeadForm({ lead, onSuccess }: EditLeadFormProps) {
  const { user } = useAuth();
  const updateLead = useUpdateLead();
  const { cars } = useCars();
  const { toast } = useToast();

  const handleSubmit = async (values: LeadFormValues) => {
    if (!lead.id) {
      toast({
        title: "שגיאה בעדכון ליד",
        description: "מזהה ליד חסר",
        variant: "destructive"
      });
      return;
    }

    const leadData = {
      name: values.name,
      email: values.email || null,
      phone: values.phone,
      notes: values.notes || null,
      car_id: values.car_id || null,
      source: values.source || "ידני",
      status: values.status,
      assigned_to: values.assigned_to || null,
      user_id: user?.id || lead.user_id,
      updated_at: new Date().toISOString()
    };

    try {
      await updateLead.mutateAsync({ id: lead.id, data: leadData });
      toast({
        title: "ליד עודכן",
        description: "הליד עודכן בהצלחה",
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("שגיאה בעדכון ליד:", error);
      toast({
        title: "שגיאה בעדכון הליד",
        description: "נסה שנית",
        variant: "destructive"
      });
    }
  };

  return (
    <LeadFormBase
      defaultValues={{
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        notes: lead.notes || "",
        car_id: lead.car_id || "",
        source: lead.source || "ידני",
        status: lead.status || "new",
        assigned_to: lead.assigned_to || ""
      }}
      onSubmit={handleSubmit}
      isSubmitting={updateLead.isPending}
    >
      {(context: FormContextValue) => (
        <>
          <EditLeadNameField control={context.form.control} />
          <EditLeadPhoneField control={context.form.control} />
          <EditLeadEmailField control={context.form.control} />
          <EditLeadCarField control={context.form.control} cars={cars || []} />
          <EditLeadStatusField control={context.form.control} />
          <EditLeadSourceField control={context.form.control} />
          {context.canAssignLeads && (
            <EditLeadAssignedField control={context.form.control} salesAgents={context.salesAgents} />
          )}
          <EditLeadNotesField control={context.form.control} />
          <Button type="submit" className="w-full" disabled={updateLead.isPending}>
            {updateLead.isPending ? "מעדכן..." : "עדכן ליד"}
          </Button>
        </>
      )}
    </LeadFormBase>
  );
}
