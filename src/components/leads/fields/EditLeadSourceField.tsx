
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function EditLeadSourceField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="source"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold">מקור</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger aria-label="בחר מקור ליד">
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
            </FormControl>
            <SelectContent dir="rtl" align="end">
              <SelectItem value="ידני">ידני</SelectItem>
              <SelectItem value="פייסבוק">פייסבוק</SelectItem>
              <SelectItem value="וואטסאפ">וואטסאפ</SelectItem>
              <SelectItem value="אינסטגרם">אינסטגרם</SelectItem>
              <SelectItem value="אחר">אחר</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
