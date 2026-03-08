
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { LeadFormValues } from "./schemas/lead-form-schema";

interface AddLeadInterestedCarFieldsProps {
  control: Control<LeadFormValues>;
}

export function AddLeadInterestedCarFields({ control }: AddLeadInterestedCarFieldsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg p-3">
      <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium">
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          🔍 רכב מבוקש (לא במלאי)
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="interested_make"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">יצרן</FormLabel>
                <FormControl>
                  <Input placeholder="למשל: טויוטה" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="interested_model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">דגם</FormLabel>
                <FormControl>
                  <Input placeholder="למשל: קורולה" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="interested_year_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">משנה</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2020" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="interested_year_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">עד שנה</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2025" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={control}
            name="interested_max_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">תקציב מקסימלי (₪)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="150000" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="interested_max_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">ק"מ מקסימלי</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100000" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
