
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function EditLeadStatusField({ control }: Props) {
  return (
    <FormField
      control={control}
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
            <SelectContent align="end" className="bg-background border-2 shadow-2xl z-50 text-right">
              <SelectItem value="new" className="justify-end text-right">חדש</SelectItem>
              <SelectItem value="in_treatment" className="justify-end text-right">בטיפול</SelectItem>
              <SelectItem value="waiting" className="justify-end text-right">ממתין</SelectItem>
              <SelectItem value="meeting_scheduled" className="justify-end text-right">נקבעה פגישה</SelectItem>
              {/* follow_up removed */}
              <SelectItem value="handled" className="justify-end text-right">טופל</SelectItem>
              <SelectItem value="not_relevant" className="justify-end text-right">לא רלוונטי</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
