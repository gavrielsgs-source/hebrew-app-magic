import { useState, useMemo } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLeads } from "@/hooks/use-leads";

interface LeadSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeNoneOption?: boolean;
}

export function LeadSearchSelect({ 
  value, 
  onValueChange, 
  placeholder = "בחר לקוח",
  includeNoneOption = false 
}: LeadSearchSelectProps) {
  const { leads } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLeads = useMemo(() => {
    if (!leads || !searchQuery.trim()) return leads || [];
    
    const query = searchQuery.toLowerCase().trim();
    return leads.filter(lead => {
      // Search by name
      if (lead.name?.toLowerCase().includes(query)) return true;
      // Search by phone
      if (lead.phone?.toLowerCase().includes(query)) return true;
      // Search by email
      if (lead.email?.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }, [leads, searchQuery]);

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        dir="rtl"
        align="end"
      >
        <div className="sticky top-0 bg-popover border-b border-border/50 p-3 z-50">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="חפש לפי שם, טלפון או אימייל..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right rounded-xl"
              dir="rtl"
              aria-label="חפש לקוח"
            />
          </div>
        </div>
        
        {includeNoneOption && (
          <SelectItem value="no-lead">
            ללא שיוך ללקוח
          </SelectItem>
        )}
        
        {filteredLeads?.length === 0 && searchQuery ? (
          <div className="p-4 text-center text-muted-foreground text-sm" role="status">
            לא נמצאו לקוחות תואמים
          </div>
        ) : (
          filteredLeads?.map((lead) => (
            <SelectItem key={lead.id} value={lead.id}>
              <div className="flex flex-col text-right w-full">
                <span className="font-medium">
                  {lead.name}
                </span>
                <div className="text-xs text-muted-foreground">
                  {lead.phone && <span>טלפון: {lead.phone}</span>}
                  {lead.email && <span className="mr-2">• {lead.email}</span>}
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}