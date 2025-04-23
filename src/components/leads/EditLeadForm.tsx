
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLeads, useUpdateLead } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoles } from "@/hooks/use-roles";
import { useUserManagement } from "@/hooks/use-user-management";
import { EditLeadNameField } from "./fields/EditLeadNameField";
import { EditLeadPhoneField } from "./fields/EditLeadPhoneField";
import { EditLeadEmailField } from "./fields/EditLeadEmailField";
import { EditLeadCarField } from "./fields/EditLeadCarField";
import { EditLeadStatusField } from "./fields/EditLeadStatusField";
import { EditLeadSourceField } from "./fields/EditLeadSourceField";
import { EditLeadAssignedField } from "./fields/EditLeadAssignedField";
import { EditLeadNotesField } from "./fields/EditLeadNotesField";

const formSchema = z.object({
  name: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  email: z.string().email("כתובת אימייל לא תקינה").optional().or(z.literal("")),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  notes: z.string().optional().or(z.literal("")),
  car_id: z.string().uuid("נא לבחור רכב").optional().or(z.literal("")),
  source: z.string().optional(),
  status: z.string(),
  assigned_to: z.string().optional().or(z.literal(""))
});

type FormValues = z.infer<typeof formSchema>;

interface EditLeadFormProps {
  lead: any;
}

export function EditLeadForm({ lead }: EditLeadFormProps) {
  const { leads } = useLeads();
  const updateLead = useUpdateLead();
  const { cars } = useCars();
  const { isAdmin, isAgencyManager } = useRoles();
  const { allUsers, isLoading: usersLoading } = useUserManagement();
  const [salesAgents, setSalesAgents] = useState<any[]>([]);
  
  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const agents = allUsers.filter(user => {
        return user.roles?.some(r => r.role === 'sales_agent' || r.role === 'admin') || false;
      });
      setSalesAgents(agents);
    }
  }, [allUsers]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      notes: lead.notes || "",
      car_id: lead.car_id || "",
      source: lead.source || "ידני",
      status: lead.status || "new",
      assigned_to: lead.assigned_to || ""
    },
  });

  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        notes: lead.notes || "",
        car_id: lead.car_id || "",
        source: lead.source || "ידני",
        status: lead.status || "new",
        assigned_to: lead.assigned_to || ""
      });
    }
  }, [lead, form]);

  const onSubmit = async (values: FormValues) => {
    if (!lead.id) {
      toast.error("שגיאה בעדכון ליד: מזהה חסר");
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
      assigned_to: values.assigned_to || null
    };
    
    try {
      await updateLead.mutateAsync({ id: lead.id, data: leadData });
      toast.success("הליד עודכן בהצלחה");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("שגיאה בעדכון הליד");
    }
  };

  const canAssignLeads = isAdmin() || isAgencyManager();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <EditLeadNameField control={form.control} />
        <EditLeadPhoneField control={form.control} />
        <EditLeadEmailField control={form.control} />
        <EditLeadCarField control={form.control} cars={cars || []} />
        <EditLeadStatusField control={form.control} />
        <EditLeadSourceField control={form.control} />
        {canAssignLeads && (
          <EditLeadAssignedField control={form.control} salesAgents={salesAgents} />
        )}
        <EditLeadNotesField control={form.control} />
        <Button type="submit" className="w-full" disabled={updateLead.isPending}>
          {updateLead.isPending ? "מעדכן..." : "עדכן ליד"}
        </Button>
      </form>
    </Form>
  );
}
