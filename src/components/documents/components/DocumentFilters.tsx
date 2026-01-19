
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  documentTypeFilter: string | null;
  onTypeFilterChange: (value: string | null) => void;
}

export function DocumentFilters({
  searchQuery,
  onSearchChange,
  documentTypeFilter,
  onTypeFilterChange
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="חפש מסמכים..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-9 text-right rounded-xl border-0 bg-muted/50 focus:bg-background transition-colors"
        />
      </div>
      
      <Select 
        value={documentTypeFilter || "all"} 
        onValueChange={(value) => onTypeFilterChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[150px] text-right rounded-xl border-0 bg-muted/50">
          <SelectValue placeholder="סוג מסמך" />
        </SelectTrigger>
        <SelectContent 
          align="end" 
          className="rounded-xl bg-popover shadow-lg border z-50"
        >
          <SelectItem value="all" className="text-right justify-end">הכל</SelectItem>
          <SelectItem value="contract" className="text-right justify-end">חוזה</SelectItem>
          <SelectItem value="id" className="text-right justify-end">תעודת זהות</SelectItem>
          <SelectItem value="license" className="text-right justify-end">רישיון</SelectItem>
          <SelectItem value="invoice" className="text-right justify-end">חשבונית</SelectItem>
          <SelectItem value="insurance" className="text-right justify-end">ביטוח</SelectItem>
          <SelectItem value="other" className="text-right justify-end">אחר</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
