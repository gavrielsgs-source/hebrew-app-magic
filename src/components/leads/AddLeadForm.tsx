
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

const formSchema = z.object({
  name: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  email: z.string().email("כתובת אימייל לא תקינה").optional().or(z.literal("")),
  phone: z.string().min(9, "מספר טלפון לא תקין").max(15, "מספר טלפון לא תקין"),
  notes: z.string().optional(),
  car_id: z.string().uuid("נא לבחור רכב")
});

export function AddLeadForm({ carId }: { carId: string }) {
  const { addLead } = useLeads();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
      car_id: carId
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await addLead.mutateAsync(values);
    form.reset();
  };

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
