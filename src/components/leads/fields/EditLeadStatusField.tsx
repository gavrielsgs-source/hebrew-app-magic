
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
            <SelectContent>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="in_treatment">בטיפול</SelectItem>
              <SelectItem value="waiting">ממתין</SelectItem>
              <SelectItem value="meeting_scheduled">נקבעה פגישה</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
