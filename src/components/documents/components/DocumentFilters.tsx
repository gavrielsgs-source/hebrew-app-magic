
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="חפש מסמכים..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-9 text-right"
        />
      </div>
      
      <Select 
        value={documentTypeFilter || "all"} 
        onValueChange={(value) => onTypeFilterChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[150px] text-right">
          <SelectValue placeholder="סוג מסמך" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="all">הכל</SelectItem>
          <SelectItem value="contract">חוזה</SelectItem>
          <SelectItem value="id">תעודת זהות</SelectItem>
          <SelectItem value="license">רישיון</SelectItem>
          <SelectItem value="invoice">חשבונית</SelectItem>
          <SelectItem value="insurance">ביטוח</SelectItem>
          <SelectItem value="other">אחר</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
