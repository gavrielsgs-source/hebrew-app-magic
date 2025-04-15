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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCars } from "@/hooks/use-cars";
import { useLeads } from "@/hooks/use-leads";
import { useTasks } from "@/hooks/use-tasks";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, "נדרשות לפחות 2 אותיות"),
  description: z.string().optional().or(z.literal("")),
  priority: z.string(),
  status: z.string(),
  type: z.string(),
  due_date: z.date().optional(),
  car_id: z.string().uuid("נא לבחור רכב").optional().or(z.literal("")),
  lead_id: z.string().uuid("נא לבחור ליד").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function TaskForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addTask } = useTasks();
  const { cars } = useCars();
  const { leads } = useLeads();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      type: "task",
      car_id: "",
      lead_id: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Make sure title is explicitly included and convert date to ISO string if present
      const formattedValues = {
        title: values.title, // Explicitly include title
        description: values.description || null,
        priority: values.priority,
        status: values.status,
        type: values.type,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        car_id: values.car_id || null,
        lead_id: values.lead_id || null,
      };

      await addTask.mutateAsync(formattedValues);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>כותרת</FormLabel>
              <FormControl>
                <Input placeholder="שיחת טלפון עם לקוח" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>תיאור</FormLabel>
              <FormControl>
                <Textarea placeholder="פרטים נוספים..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוג</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="task">משימה</SelectItem>
                    <SelectItem value="call">שיחת טלפון</SelectItem>
                    <SelectItem value="meeting">פגישה</SelectItem>
                    <SelectItem value="follow_up">מעקב</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>עדיפות</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר עדיפות" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">נמוכה</SelectItem>
                    <SelectItem value="medium">בינונית</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>תאריך יעד</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-right font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>בחר תאריך</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                  <SelectItem value="pending">ממתין</SelectItem>
                  <SelectItem value="in_progress">בביצוע</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="car_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>רכב קשור (אופציונלי)</FormLabel>
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
        
        <FormField
          control={form.control}
          name="lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ליד קשור (אופציונלי)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר ליד" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leads?.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} - {lead.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={addTask.isPending}>
          {addTask.isPending ? "מוסיף..." : "הוסף משימה"}
        </Button>
      </form>
    </Form>
  );
}
