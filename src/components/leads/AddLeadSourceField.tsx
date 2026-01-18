
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Control } from "react-hook-form";

type Props = { control: Control<any> };

export function AddLeadSourceField({ control }: Props) {
  return (
    <FormField
      control={control}
      name="source"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base font-semibold">מקור</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger aria-label="בחר מקור ליד" className="rounded-xl text-right">
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              align="end" 
              className="rounded-xl bg-popover border shadow-lg z-50"
            >
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
