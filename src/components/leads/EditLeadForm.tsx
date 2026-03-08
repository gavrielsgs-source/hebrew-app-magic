
import { Button } from "@/components/ui/button";
import { useLeads, useUpdateLead } from "@/hooks/use-leads";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { AddLeadInterestedCarFields } from "./AddLeadInterestedCarFields";

interface EditLeadFormProps {
  lead: any;
  onSuccess?: () => void;
}

export function EditLeadForm({ lead, onSuccess }: EditLeadFormProps) {
  const { user } = useAuth();
  const updateLead = useUpdateLead();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async (values: LeadFormValues) => {
    if (!lead.id) {
      toast({
        title: "שגיאה בעדכון ליד",
        description: "מזהה ליד חסר",
        variant: "destructive"
      });
      return;
    }

    console.log("Updating lead with values:", values);

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
      updated_at: new Date().toISOString(),
      interested_make: values.interested_make || null,
      interested_model: values.interested_model || null,
      interested_year_from: values.interested_year_from || null,
      interested_year_to: values.interested_year_to || null,
      interested_max_price: values.interested_max_price || null,
      interested_max_km: values.interested_max_km || null,
    };

    try {
      await updateLead.mutateAsync({ id: lead.id, data: leadData });
      console.log("Lead updated successfully");
      
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
        assigned_to: lead.assigned_to || "",
        interested_make: lead.interested_make || "",
        interested_model: lead.interested_model || "",
        interested_year_from: lead.interested_year_from || ('' as unknown as number | ""),
        interested_year_to: lead.interested_year_to || ('' as unknown as number | ""),
        interested_max_price: lead.interested_max_price || ('' as unknown as number | ""),
        interested_max_km: lead.interested_max_km || ('' as unknown as number | ""),
      }}
      onSubmit={handleSubmit}
      isSubmitting={updateLead.isPending}
    >
      {(context: FormContextValue) => (
        <div className={`space-y-4 ${isMobile ? 'space-y-3' : ''}`}>
          <EditLeadNameField control={context.form.control} />
          <EditLeadPhoneField control={context.form.control} />
          <EditLeadEmailField control={context.form.control} />
          <EditLeadCarField control={context.form.control} />
          <EditLeadStatusField control={context.form.control} />
          <EditLeadSourceField control={context.form.control} />
          {/* Assigned field hidden - will be re-enabled later */}
          <EditLeadNotesField control={context.form.control} />
          <AddLeadInterestedCarFields control={context.form.control} />
          <Button 
            type="submit" 
            className={`w-full ${isMobile ? 'h-12 text-sm' : ''}`}
            disabled={updateLead.isPending}
          >
            {updateLead.isPending ? "מעדכן..." : "עדכן ליד"}
          </Button>
        </div>
      )}
    </LeadFormBase>
  );
}
