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
import { useLeads } from "@/hooks/use-leads";
import { useCars } from "@/hooks/use-cars";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRoles } from "@/hooks/use-roles";
import { useUserManagement } from "@/hooks/use-user-management";

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
  const { updateLead } = useLeads();
  const { cars } = useCars();
  const { isAdmin, isAgencyManager } = useRoles();
  const { allUsers, isLoading: usersLoading } = useUserManagement();
  const [salesAgents, setSalesAgents] = useState<any[]>([]);
  
  // Filter users to only show sales agents and admins
  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const agents = allUsers.filter(user => {
        // Safely check if roles exists first
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

  // Update form values when the lead changes
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

  // Only admins and managers can assign leads to other agents
  const canAssignLeads = isAdmin() || isAgencyManager();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>שם</FormLabel>
              <FormControl>
                <Input placeholder="ישראל ישראלי" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>טלפון</FormLabel>
              <FormControl>
                <Input placeholder="050-0000000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>אימייל</FormLabel>
              <FormControl>
                <Input placeholder="israel@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="car_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>רכב (אופציונלי)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר רכב" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">ללא רכב</SelectItem>
                  {cars?.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סטטוס</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">חדש</SelectItem>
                  <SelectItem value="in_progress">בטיפול</SelectItem>
                  <SelectItem value="waiting">בהמתנה</SelectItem>
                  <SelectItem value="closed">סגור</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>מקור</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מקור" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ידני">ידני</SelectItem>
                  <SelectItem value="פייסבוק">פייסבוק</SelectItem>
                  <SelectItem value="וואטסאפ">וואטסאפ</SelectItem>
                  <SelectItem value="אינסטגרם">אינסטגרם</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {canAssignLeads && (
          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>איש מכירות מטפל</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוכן מכירות" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">לא משויך</SelectItem>
                    {salesAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.email} {agent.full_name ? `(${agent.full_name})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>הערות</FormLabel>
              <FormControl>
                <Textarea placeholder="הערות נוספות..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={updateLead.isPending}>
          {updateLead.isPending ? "מעדכן..." : "עדכן ליד"}
        </Button>
      </form>
    </Form>
  );
}
