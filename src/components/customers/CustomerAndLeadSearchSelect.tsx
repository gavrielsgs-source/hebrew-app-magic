import { Check, ChevronsUpDown, User, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { useCustomers } from "@/hooks/customers";
import { useLeads } from "@/hooks/use-leads";

interface CustomerAndLeadSearchSelectProps {
  value?: { type: 'customer' | 'lead'; id: string } | null;
  onValueChange: (value: { type: 'customer' | 'lead'; id: string; data: any }) => void;
  placeholder?: string;
}

export function CustomerAndLeadSearchSelect({
  value,
  onValueChange,
  placeholder = "בחר לקוח או ליד...",
}: CustomerAndLeadSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const { data: customers = [] } = useCustomers();
  const { leads = [] } = useLeads();

  // Combine customers and leads into a single list
  const allOptions = [
    ...customers.map(customer => ({
      type: 'customer' as const,
      id: customer.id,
      label: customer.full_name,
      phone: customer.phone,
      data: customer,
    })),
    ...leads.map(lead => ({
      type: 'lead' as const,
      id: lead.id,
      label: lead.name,
      phone: lead.phone,
      data: lead,
    })),
  ];

  const selectedOption = allOptions.find(
    opt => value && opt.type === value.type && opt.id === value.id
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-right h-12 rounded-xl"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2">
              {selectedOption.type === 'customer' ? (
                <User className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>{selectedOption.label}</span>
              {selectedOption.phone && (
                <span className="text-muted-foreground text-sm">
                  ({selectedOption.phone})
                </span>
              )}
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[95vw] sm:w-full max-w-md p-0 z-[9999] bg-background border shadow-lg rounded-xl pointer-events-auto" 
        align="start" 
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder="חפש לקוח או ליד..." className="text-right h-12" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
            {customers.length > 0 && (
              <CommandGroup heading="לקוחות">
                {customers.map((customer) => (
                  <CommandItem
                    key={`customer-${customer.id}`}
                    value={`${customer.full_name} ${customer.phone || ''}`}
                    onSelect={() => {
                      onValueChange({
                        type: 'customer',
                        id: customer.id,
                        data: customer,
                      });
                      setOpen(false);
                    }}
                    className="text-right"
                  >
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value?.type === 'customer' && value?.id === customer.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <User className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>{customer.full_name}</span>
                      {customer.phone && (
                        <span className="text-sm text-muted-foreground">
                          {customer.phone}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {leads.length > 0 && (
              <CommandGroup heading="לידים">
                {leads.map((lead) => (
                  <CommandItem
                    key={`lead-${lead.id}`}
                    value={`${lead.name} ${lead.phone || ''}`}
                    onSelect={() => {
                      onValueChange({
                        type: 'lead',
                        id: lead.id,
                        data: lead,
                      });
                      setOpen(false);
                    }}
                    className="text-right"
                  >
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4",
                        value?.type === 'lead' && value?.id === lead.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <UserPlus className="h-4 w-4 mr-2" />
                    <div className="flex flex-col">
                      <span>{lead.name}</span>
                      {lead.phone && (
                        <span className="text-sm text-muted-foreground">
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
