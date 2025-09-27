import { useState, useMemo } from "react";
import { FormControl } from "@/components/ui/form";
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
      <FormControl>
        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent 
        align="start" 
        sideOffset={4}
        className="rounded-xl border-2 w-[var(--radix-select-trigger-width)] min-w-[250px]"
      >
        <div className="sticky top-0 bg-background border-b p-2 z-50">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם, טלפון או אימייל..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 text-right"
              dir="rtl"
            />
          </div>
        </div>
        
        {includeNoneOption && (
          <SelectItem value="no-lead" className="text-center">
            ללא שיוך ללקוח
          </SelectItem>
        )}
        
        {filteredLeads?.length === 0 && searchQuery ? (
          <div className="p-2 text-center text-muted-foreground text-sm">
            לא נמצאו לקוחות תואמים
          </div>
        ) : (
          filteredLeads?.map((lead) => (
            <SelectItem key={lead.id} value={lead.id} className="text-center">
              <div className="flex flex-col text-center w-full items-center">
                <span className="font-medium">
                  {lead.name}
                </span>
                <div className="text-xs text-muted-foreground">
                  <div className="flex flex-col text-center items-center">
                    {lead.phone && <span>טלפון: {lead.phone}</span>}
                    {lead.email && <span>אימייל: {lead.email}</span>}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}