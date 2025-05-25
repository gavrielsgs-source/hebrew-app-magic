
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const scheduleFormSchema = z.object({
  title: z.string().min(1, "כותרת חובה"),
  description: z.string().optional(),
  type: z.enum(["meeting", "call", "follow_up", "reminder"]),
  date: z.date({ required_error: "יש לבחור תאריך" }),
  time: z.string().min(1, "יש לבחור שעה"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleMeetingFormProps {
  lead: any;
  onSuccess?: () => void;
}

export function ScheduleMeetingForm({ lead, onSuccess }: ScheduleMeetingFormProps) {
  const { user } = useAuth();
  const { addTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "meeting",
      time: "",
      priority: "medium",
    },
  });

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = data.time.split(':');
      const dueDate = new Date(data.date);
      dueDate.setHours(parseInt(hours), parseInt(minutes));

      const taskData = {
        title: `${data.title} - ${lead.name}`,
        description: data.description || null,
        status: "pending",
        priority: data.priority,
        type: data.type,
        due_date: dueDate.toISOString(),
        lead_id: lead.id,
        car_id: lead.car_id || null,
      };

      await addTask.mutateAsync(taskData);
      
      toast.success("הפגישה/תזכורת נוצרה בהצלחה");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("שגיאה ביצירת הפגישה/תזכורת");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>סוג הפעילות</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג פעילות" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="meeting">פגישה</SelectItem>
                    <SelectItem value="call">שיחת טלפון</SelectItem>
                    <SelectItem value="follow_up">מעקב</SelectItem>
                    <SelectItem value="reminder">תזכורת</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>כותרת</FormLabel>
                <FormControl>
                  <Input placeholder="למשל: פגישה להצגת רכב" {...field} />
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
                <FormLabel>תיאור (אופציונלי)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="פרטים נוספים על הפגישה..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>תאריך</FormLabel>
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
                            format(field.value, "PPP", { locale: he })
                          ) : (
                            <span>בחר תאריך</span>
                          )}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
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
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שעה</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="time" 
                        {...field}
                        className="pl-10"
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "יוצר..." : "צור פגישה/תזכורת"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
