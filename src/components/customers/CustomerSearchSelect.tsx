import { useState, useMemo } from "react";
import { FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCustomers } from "@/hooks/customers";

interface CustomerSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeNoneOption?: boolean;
  noneValue?: string;
}

export function CustomerSearchSelect({ 
  value, 
  onValueChange, 
  placeholder = "בחר לקוח",
  includeNoneOption = false,
  noneValue = "none"
}: CustomerSearchSelectProps) {
  const { data: customers = [] } = useCustomers();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    if (!customers || !searchQuery.trim()) return customers || [];
    
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(customer => {
      // Search by ID number
      if (customer.id_number?.toLowerCase().includes(query)) return true;
      // Search by full name
      if (customer.full_name?.toLowerCase().includes(query)) return true;
      // Search by phone
      if (customer.phone?.toLowerCase().includes(query)) return true;
      // Search by email
      if (customer.email?.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }, [customers, searchQuery]);

  return (
    <Select onValueChange={onValueChange} value={value}>
      <FormControl>
        <SelectTrigger dir="rtl" className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all text-right overflow-hidden [&>span]:w-full [&>span]:text-right [&>span]:truncate">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent 
        dir="rtl"
        side="bottom"
        align="end" 
        avoidCollisions={false}
        sideOffset={6}
        className="rounded-xl border-2 text-right z-[1000] w-[var(--radix-select-trigger-width)] min-w-[300px] bg-popover"
      >
        <div className="sticky top-0 bg-background border-b p-2 z-50">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי שם, תעודת זהות או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 text-right"
              dir="rtl"
            />
          </div>
        </div>
        
        {includeNoneOption && (
          <SelectItem value={noneValue} className="text-center">
            ללא שיוך ללקוח
          </SelectItem>
        )}
        
        {filteredCustomers?.length === 0 && searchQuery ? (
          <div className="p-2 text-center text-muted-foreground text-sm">
            לא נמצאו לקוחות תואמים
          </div>
        ) : (
          filteredCustomers?.map((customer) => (
            <SelectItem key={customer.id as string} value={customer.id as string} className="text-center">
              <div className="flex flex-col text-center w-full items-center">
                <span className="font-medium">
                  {customer.full_name}
                </span>
                <div className="text-xs text-muted-foreground">
                  <div className="flex flex-col text-center items-center">
                    {customer.id_number && <span>ת.ז: {customer.id_number}</span>}
                    {customer.phone && <span>טלפון: {customer.phone}</span>}
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