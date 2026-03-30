
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useFormContext } from "react-hook-form";
import type { TaskFormValues } from "@/types/task";
import { useState } from "react";

interface TaskDateAndStatusProps {
  hiddenOnMobile?: boolean;
}

export function TaskDateAndStatus({ hiddenOnMobile = false }: TaskDateAndStatusProps) {
  const form = useFormContext<TaskFormValues>();
  const [timeHour, setTimeHour] = useState<string>("none");
  const [timeMinute, setTimeMinute] = useState<string>("00");

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      form.setValue("due_date", undefined);
      return;
    }

    // If we have time values, combine them with the date
    if (timeHour && timeHour !== "none") {
      const hour = parseInt(timeHour);
      const minute = parseInt(timeMinute);
      const dateWithTime = new Date(date);
      dateWithTime.setHours(hour, minute, 0, 0);
      form.setValue("due_date", dateWithTime);
    } else {
      // Set date without specific time (will use midnight)
      form.setValue("due_date", date);
    }
  };

  const handleTimeChange = (hour: string, minute: string) => {
    setTimeHour(hour);
    setTimeMinute(minute);
    
    const currentDate = form.getValues("due_date");
    if (currentDate && hour && hour !== "none") {
      const dateWithTime = new Date(currentDate);
      dateWithTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      form.setValue("due_date", dateWithTime);
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="due_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>תאריך ושעת יעד</FormLabel>
            <div className="space-y-2">
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
                        timeHour && timeHour !== "none" ? 
                          format(field.value, "dd/MM/yyyy HH:mm") :
                          format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>בחר תאריך</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 z-[200] bg-background mx-auto" 
                  align="center" 
                  side="bottom" 
                  collisionPadding={{ left: 16, right: 16, top: 8, bottom: 8 }}
                  avoidCollisions={true}
                  style={{ maxWidth: 'calc(100vw - 2rem)' }}
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateSelect}
                    initialFocus
                    className={cn("p-3 pointer-events-auto w-full")}
                  />
                </PopoverContent>
              </Popover>
              
              {field.value && (
                <div className="flex items-center gap-3 p-3 border rounded-md bg-muted/50">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">שעה (אופציונלי):</span>
                  <div className="flex items-center gap-2 mr-auto">
                    <Select value={timeMinute} onValueChange={(minute) => handleTimeChange(timeHour, minute)}>
                      <SelectTrigger className="w-[90px] h-9 text-center [&>span]:w-full [&>span]:text-center">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end" className="bg-background border-2 shadow-2xl z-50 text-right">
                        {["00", "15", "30", "45"].map((minute) => (
                          <SelectItem key={minute} value={minute} className="justify-end text-right">
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm font-medium">:</span>
                    <Select value={timeHour} onValueChange={(hour) => handleTimeChange(hour, timeMinute)}>
                      <SelectTrigger className="w-[90px] h-9 text-center [&>span]:w-full [&>span]:text-center">
                        <SelectValue placeholder="--" />
                      </SelectTrigger>
                      <SelectContent align="end" className="bg-background border-2 shadow-2xl z-50 text-right max-h-[200px] overflow-y-auto">
                        <SelectItem value="none" className="justify-end text-right">ללא</SelectItem>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')} className="justify-end text-right">
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {!hiddenOnMobile && (
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>סטטוס</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="text-right [&>span]:w-full [&>span]:text-right">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent align="end" className="bg-background border-2 shadow-2xl z-50 text-right min-w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="pending" className="justify-end text-right">ממתין</SelectItem>
                  <SelectItem value="in_progress" className="justify-end text-right">בביצוע</SelectItem>
                  <SelectItem value="completed" className="justify-end text-right">הושלם</SelectItem>
                  <SelectItem value="cancelled" className="justify-end text-right">בוטל</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
