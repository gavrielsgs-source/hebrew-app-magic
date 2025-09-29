
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
          <FormLabel className="text-lg font-semibold">מקור</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-12 text-lg rounded-xl border-2 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="בחר מקור" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white rounded-2xl shadow-2xl border-2 z-50" dir="rtl">
              <SelectItem value="ידני" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">ידני</SelectItem>
              <SelectItem value="פייסבוק" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">פייסבוק</SelectItem>
              <SelectItem value="וואטסאפ" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">וואטסאפ</SelectItem>
              <SelectItem value="אינסטגרם" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">אינסטגרם</SelectItem>
              <SelectItem value="אחר" className="text-lg p-4 rounded-xl hover:bg-slate-50 cursor-pointer text-right">אחר</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
