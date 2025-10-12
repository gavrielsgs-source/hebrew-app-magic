
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function EditLeadPhoneField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>טלפון</FormLabel>
          <FormControl>
            <Input 
              placeholder="050-0000000" 
              {...field} 
              value={field.value || ""} 
              dir="ltr"
              className="text-left"
            />
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground text-right mt-1">
            המספר יומר אוטומטית לפורמט 972XXXXXXXXX
          </p>
        </FormItem>
      )}
    />
  );
}
