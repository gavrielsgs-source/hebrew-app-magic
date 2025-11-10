import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SubscriptionFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  tierFilter: string;
  onTierChange: (value: string) => void;
}

export function SubscriptionFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  tierFilter,
  onTierChange,
}: SubscriptionFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי אימייל או שם..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 text-right"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="סינון לפי סטטוס" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="active">פעיל</SelectItem>
          <SelectItem value="trial">ניסיון</SelectItem>
          <SelectItem value="expired">פג תוקף</SelectItem>
          <SelectItem value="past_due">תשלום נכשל</SelectItem>
          <SelectItem value="cancelled">מבוטל</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tierFilter} onValueChange={onTierChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="סינון לפי חבילה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל החבילות</SelectItem>
          <SelectItem value="free">חינם</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
          <SelectItem value="business">Business</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
