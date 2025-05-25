
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
              <SelectItem value="contacted">צורר</SelectItem>
              <SelectItem value="qualified">מוכשר</SelectItem>
              <SelectItem value="converted">הומר</SelectItem>
              <SelectItem value="closed">סגור</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
