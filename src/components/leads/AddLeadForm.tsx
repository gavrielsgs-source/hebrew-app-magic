
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { useLeads, useCreateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { useEffect, useState } from "react";
import { useRoles } from "@/hooks/use-roles";
import { useUserManagement } from "@/hooks/use-user-management";
import { useAuth } from "@/hooks/use-auth";

// Refactored fields
import { AddLeadNameField } from "./AddLeadNameField";
import { AddLeadPhoneField } from "./AddLeadPhoneField";
import { AddLeadEmailField } from "./AddLeadEmailField";
import { AddLeadCarField } from "./AddLeadCarField";
import { AddLeadSourceField } from "./AddLeadSourceField";
import { AddLeadAssignedField } from "./AddLeadAssignedField";
import { AddLeadNotesField } from "./AddLeadNotesField";

const formSchema = z.object({
  name: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  email: z.string().email("כתובת אימייל לא תקינה").optional().or(z.literal("")),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  notes: z.string().optional().or(z.literal("")),
  car_id: z.string().uuid("נא לבחור רכב").optional().or(z.literal("")),
  source: z.string().optional(),
  assigned_to: z.string().optional().or(z.literal(""))
});

type FormValues = z.infer<typeof formSchema>;

export function AddLeadForm({ carId }: { carId?: string }) {
  const { leads } = useLeads();
  const addLead = useCreateLead();
  const { cars } = useCars();
  const { user } = useAuth();
  const { isAdmin, isAgencyManager } = useRoles();
  const { allUsers } = useUserManagement();
  const [salesAgents, setSalesAgents] = useState<any[]>([]);

  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const agents = allUsers.filter(user =>
        user.roles?.some(r => r.role === 'sales_agent' || r.role === 'admin') || false
      );
      setSalesAgents(agents);
    }
  }, [allUsers]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      car_id: carId || "",
      source: "ידני",
      assigned_to: user?.id || ""
    },
  });

  const onSubmit = async (values: FormValues) => {
    const leadData = {
      name: values.name,
      email: values.email || null,
      phone: values.phone,
      notes: values.notes || null,
      car_id: values.car_id || null,
      source: values.source || "ידני",
      status: "new",
      assigned_to: values.assigned_to || null,
      user_id: user?.id || null  // Explicitly set user_id for RLS
    };

    await addLead.mutateAsync(leadData);
    form.reset();
  };

  const canAssignLeads = isAdmin() || isAgencyManager();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
      </form>
    </Form>
  );
}
