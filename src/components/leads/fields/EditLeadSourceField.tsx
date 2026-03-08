
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
              <SelectTrigger>
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
            </FormControl>
            <SelectContent align="end" className="bg-background border-2 shadow-2xl z-50 text-right">
              <SelectItem value="ידני" className="justify-end text-right">ידני</SelectItem>
              <SelectItem value="פייסבוק" className="justify-end text-right">פייסבוק</SelectItem>
              <SelectItem value="וואטסאפ" className="justify-end text-right">וואטסאפ</SelectItem>
              <SelectItem value="אינסטגרם" className="justify-end text-right">אינסטגרם</SelectItem>
              <SelectItem value="אחר" className="justify-end text-right">אחר</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
