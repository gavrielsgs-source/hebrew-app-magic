
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

export function TaskDateAndStatus() {
  const form = useFormContext<TaskFormValues>();
  const [timeHour, setTimeHour] = useState<string>("");
  const [timeMinute, setTimeMinute] = useState<string>("00");

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      form.setValue("due_date", undefined);
      return;
    }

    // If we have time values, combine them with the date
    if (timeHour) {
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
    if (currentDate && hour) {
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
                        timeHour ? 
                          format(field.value, "dd/MM/yyyy HH:mm") :
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
                    onSelect={handleDateSelect}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {field.value && (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50" dir="rtl">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">שעה (אופציונלי):</span>
                  <Select value={timeHour} onValueChange={(hour) => handleTimeChange(hour, timeMinute)}>
                    <SelectTrigger className="w-20 text-center [&>span]:w-full [&>span]:text-center">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                    <SelectContent 
                      dir="rtl" 
                      side="bottom" 
                      align="center" 
                      className="z-50 bg-background"
                    >
                      <SelectItem value="" className="text-center">ללא</SelectItem>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString().padStart(2, '0')} className="text-center">
                          {i.toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm">:</span>
                  <Select value={timeMinute} onValueChange={(minute) => handleTimeChange(timeHour, minute)}>
                    <SelectTrigger className="w-20 text-center [&>span]:w-full [&>span]:text-center">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      dir="rtl" 
                      side="bottom" 
                      align="center" 
                      className="z-50 bg-background"
                    >
                      {["00", "15", "30", "45"].map((minute) => (
                        <SelectItem key={minute} value={minute} className="text-center">
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
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
                <SelectTrigger className="text-right [&>span]:w-full [&>span]:text-right">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                dir="rtl" 
                side="bottom" 
                align="end" 
                avoidCollisions={false} 
                sideOffset={6}
                className="z-50 min-w-[var(--radix-select-trigger-width)] bg-background"
              >
                <SelectItem value="pending" className="text-center">ממתין</SelectItem>
                <SelectItem value="in_progress" className="text-center">בביצוע</SelectItem>
                <SelectItem value="completed" className="text-center">הושלם</SelectItem>
                <SelectItem value="cancelled" className="text-center">בוטל</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
