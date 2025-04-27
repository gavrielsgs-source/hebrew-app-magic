
import { Button } from "@/components/ui/button";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useAuth } from "@/hooks/use-auth";
import { LeadFormBase, FormContextValue } from "./LeadFormBase";
import { LeadFormValues } from "./schemas/lead-form-schema";
import { AddLeadNameField } from "./AddLeadNameField";
import { AddLeadPhoneField } from "./AddLeadPhoneField";
import { AddLeadEmailField } from "./AddLeadEmailField";
import { AddLeadCarField } from "./AddLeadCarField";
import { AddLeadSourceField } from "./AddLeadSourceField";
import { AddLeadAssignedField } from "./AddLeadAssignedField";
import { AddLeadNotesField } from "./AddLeadNotesField";

export function AddLeadForm({ carId }: { carId?: string }) {
  const { user } = useAuth();
  const addLead = useCreateLead();
  const { cars } = useCars();

  const handleSubmit = async (values: LeadFormValues) => {
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

    await addLead.mutateAsync(leadData);
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
          <Button type="submit" className="w-full" disabled={addLead.isPending}>
            {addLead.isPending ? "מוסיף..." : "הוסף ליד"}
          </Button>
        </>
      )}
    </LeadFormBase>
  );
}
