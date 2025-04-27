
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, isAfter, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { useCreateReminder, useUpdateReminder } from "@/hooks/use-leads";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface LeadRemindersProps {
  lead: any;
  canAddReminder?: boolean;
}

const formSchema = z.object({
  note: z.string().min(2, "יש להזין לפחות 2 תווים"),
  date: z.date({
    required_error: "יש לבחור תאריך",
  }).refine(date => isAfter(date, new Date()), {
    message: "התאריך חייב להיות בעתיד",
  }),
});

export function LeadReminders({ lead, canAddReminder = false }: LeadRemindersProps) {
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createReminder.mutateAsync({
        leadId: lead.id,
        reminderDate: values.date.toISOString(),
        note: values.note,
      });
      toast.success("התזכורת נוספה בהצלחה");
      form.reset();
    } catch (error) {
      toast.error("שגיאה בהוספת התזכורת");
      console.error(error);
    }
  };

  const handleReminderStatusChange = async (index: number, checked: boolean) => {
    try {
      await updateReminder.mutateAsync({
        leadId: lead.id,
        reminderIndex: index,
        completed: checked,
      });
      toast.success(checked ? "התזכורת סומנה כהושלמה" : "התזכורת סומנה כלא הושלמה");
    } catch (error) {
      toast.error("שגיאה בעדכון התזכורת");
      console.error(error);
    }
  };

  // מיון התזכורות לפי תאריך
  const sortedReminders = lead.follow_up_notes && Array.isArray(lead.follow_up_notes)
    ? [...lead.follow_up_notes].sort((a: any, b: any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
    : [];

  return (
    <div className="p-4 space-y-4">
      {canAddReminder && (
        <>
          <h3 className="text-lg font-medium">הוסף תזכורת</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>תאריך תזכורת</FormLabel>
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
                              format(field.value, "P", { locale: he })
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
                          initialFocus
                          locale={he}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תוכן התזכורת</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="הזן את תוכן התזכורת..." 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={createReminder.isPending}
              >
                {createReminder.isPending ? "מוסיף..." : "הוסף תזכורת"}
              </Button>
            </form>
          </Form>
          <Separator />
        </>
      )}
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">תזכורות מתוזמנות</h3>
        
        {sortedReminders.length > 0 ? (
          <div className="space-y-3">
            {sortedReminders.map((reminder: any, index: number) => (
              <div
                key={index}
                className={`flex items-start p-3 rounded-md border ${
                  reminder.completed
                    ? "bg-slate-50 border-slate-200"
                    : isAfter(new Date(reminder.date), new Date())
                    ? "bg-blue-50 border-blue-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <Checkbox
                  checked={reminder.completed}
                  onCheckedChange={(checked) => handleReminderStatusChange(index, !!checked)}
                  className="mt-1 mr-2"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {reminder.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium">
                      {format(new Date(reminder.date), "PPP", { locale: he })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{reminder.note}</p>
                  {reminder.completed && reminder.completed_at && (
                    <p className="text-xs text-slate-500 mt-1">
                      הושלמה ב-{format(new Date(reminder.completed_at), "PPP", { locale: he })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">אין תזכורות מתוזמנות.</p>
        )}
      </div>
    </div>
  );
}
