
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import type { TaskFormValues } from "@/types/task";

export function TaskTypeAndPriority() {
  const form = useFormContext<TaskFormValues>();

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>סוג</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="text-right rounded-xl [&>span]:w-full [&>span]:text-right">
                  <SelectValue placeholder="בחר סוג" />
                </SelectTrigger>
              </FormControl>
              <SelectContent 
                dir="rtl"
                side="bottom"
                align="end"
                avoidCollisions={false}
                sideOffset={4}
                className="z-[200] rounded-xl border border-border/50 bg-background shadow-lg"
              >
                <SelectItem value="task" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">משימה</SelectItem>
                <SelectItem value="call" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">שיחת טלפון</SelectItem>
                <SelectItem value="meeting" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">פגישה</SelectItem>
                <SelectItem value="follow_up" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">מעקב</SelectItem>
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
                <SelectTrigger className="text-right rounded-xl [&>span]:w-full [&>span]:text-right">
                  <SelectValue placeholder="בחר עדיפות" />
                </SelectTrigger>
              </FormControl>
              <SelectContent 
                dir="rtl"
                side="bottom"
                align="end"
                avoidCollisions={false}
                sideOffset={4}
                className="z-[200] rounded-xl border border-border/50 bg-background shadow-lg"
              >
                <SelectItem value="low" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">נמוכה</SelectItem>
                <SelectItem value="medium" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">בינונית</SelectItem>
                <SelectItem value="high" className="justify-end text-right cursor-pointer rounded-lg mx-1 my-0.5">גבוהה</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
