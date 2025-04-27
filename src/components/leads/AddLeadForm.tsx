
import { Button } from "@/components/ui/button";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useAuth } from "@/hooks/use-auth";
import { LeadFormBase } from "./LeadFormBase";
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
      {({ form, salesAgents, canAssignLeads }) => (
        <>
          <AddLeadNameField control={form.control} />
          <AddLeadPhoneField control={form.control} />
          <AddLeadEmailField control={form.control} />
          {!carId && <AddLeadCarField control={form.control} cars={cars || []} />}
          <AddLeadSourceField control={form.control} />
          {canAssignLeads && (
            <AddLeadAssignedField
              control={form.control}
              salesAgents={salesAgents}
            />
          )}
          <AddLeadNotesField control={form.control} />
          <Button type="submit" className="w-full" disabled={addLead.isPending}>
            {addLead.isPending ? "מוסיף..." : "הוסף ליד"}
          </Button>
        </>
      )}
    </LeadFormBase>
  );
}
