
import { useState } from "react";
import * as React from "react"; // Add this import to fix the TypeScript error
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format, isAfter, parseISO, isValid } from "date-fns";
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
  const sortedReminders = React.useMemo(() => {
    if (!lead.follow_up_notes || !Array.isArray(lead.follow_up_notes)) {
      return [];
    }
    
    return [...lead.follow_up_notes]
      .filter(reminder => reminder && reminder.date)
      .sort((a: any, b: any) => {
        // Validate dates before comparison
        try {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          
          if (!isValid(dateA) || !isValid(dateB)) {
            return 0;
          }
          
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error("Error sorting reminder dates:", error);
          return 0;
        }
      });
  }, [lead.follow_up_notes]);

  // Safely format a date string
  const safeFormatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isValid(date) 
        ? format(date, "PPP", { locale: he }) 
        : "תאריך לא תקין";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "תאריך לא תקין";
    }
  };

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
            {sortedReminders.map((reminder: any, index: number) => {
              // Skip rendering invalid reminders
              if (!reminder || !reminder.date) {
                return null;
              }
              
              let reminderDate;
              try {
                reminderDate = new Date(reminder.date);
                if (!isValid(reminderDate)) {
                  console.warn("Invalid reminder date:", reminder.date);
                  return null;
                }
              } catch (error) {
                console.error("Error parsing reminder date:", error);
                return null;
              }
              
              const isFutureDate = isAfter(reminderDate, new Date());
              
              return (
                <div
                  key={index}
                  className={`flex items-start p-3 rounded-md border ${
                    reminder.completed
                      ? "bg-slate-50 border-slate-200"
                      : isFutureDate
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
                        {safeFormatDate(reminder.date)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-line">{reminder.note}</p>
                    {reminder.completed && reminder.completed_at && (
                      <p className="text-xs text-slate-500 mt-1">
                        הושלמה ב-{safeFormatDate(reminder.completed_at)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">אין תזכורות מתוזמנות.</p>
        )}
      </div>
    </div>
  );
}
