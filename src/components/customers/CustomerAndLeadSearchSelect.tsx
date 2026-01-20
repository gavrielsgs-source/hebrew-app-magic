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
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { useCustomers } from "@/hooks/customers";
import { useLeads } from "@/hooks/use-leads";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

  const TriggerButton = (
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      className="w-full justify-between text-right h-12 rounded-xl"
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
  );

  const CommandContent = (
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
  );

  // Use Drawer for mobile, Popover for desktop
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {TriggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-right">
            <DrawerTitle>בחר לקוח או ליד</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            {CommandContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {TriggerButton}
      </PopoverTrigger>
      <PopoverContent 
        className="w-full max-w-md p-0 z-[9999] bg-background border shadow-lg rounded-xl" 
        align="start" 
        sideOffset={8}
      >
        {CommandContent}
      </PopoverContent>
    </Popover>
  );
}
