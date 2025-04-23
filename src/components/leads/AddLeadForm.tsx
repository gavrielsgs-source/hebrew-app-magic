
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
import { useRoles } from "@/hooks/use-roles";
import { useUserManagement } from "@/hooks/use-user-management";
import { useAuth } from "@/hooks/use-auth";

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
  const { addLead } = useLeads();
  const { cars } = useCars();
  const { user } = useAuth();
  const { isAdmin, isAgencyManager } = useRoles();
  const { allUsers } = useUserManagement();
  const [salesAgents, setSalesAgents] = useState<any[]>([]);
  
  // Filter users to only show sales agents and admins
  useEffect(() => {
    if (allUsers && allUsers.length > 0) {
      const agents = allUsers.filter(user => {
        // Filter by role
        return user.roles?.some(r => r.role === 'sales_agent' || r.role === 'admin');
      });
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
      assigned_to: values.assigned_to || null
    };
    
    await addLead.mutateAsync(leadData);
    form.reset();
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
        {!carId && (
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
        )}
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
                <FormLabel>הקצה לאיש מכירות</FormLabel>
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
        <Button type="submit" className="w-full" disabled={addLead.isPending}>
          {addLead.isPending ? "מוסיף..." : "הוסף ליד"}
        </Button>
      </form>
    </Form>
  );
}
