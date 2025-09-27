import { useState, useMemo } from "react";
import { FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCars } from "@/hooks/use-cars";

interface CarSearchSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  includeNoneOption?: boolean;
}

export function CarSearchSelect({ 
  value, 
  onValueChange, 
  placeholder = "בחר רכב",
  includeNoneOption = false 
}: CarSearchSelectProps) {
  const { cars } = useCars();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCars = useMemo(() => {
    if (!cars || !searchQuery.trim()) return cars || [];
    
    const query = searchQuery.toLowerCase().trim();
    return cars.filter(car => {
      // Search by chassis number
      if (car.chassis_number?.toLowerCase().includes(query)) return true;
      // Search by license number  
      if (car.license_number?.toLowerCase().includes(query)) return true;
      // Search by make + model
      const carName = `${car.make} ${car.model}`.toLowerCase();
      if (carName.includes(query)) return true;
      // Search by year
      if (car.year?.toString().includes(query)) return true;
      
      return false;
    });
  }, [cars, searchQuery]);

  return (
    <Select onValueChange={onValueChange} value={value}>
      <FormControl>
        <SelectTrigger className="h-12 rounded-xl border-2 border-slate-200 focus:border-brand-primary transition-all text-right [&>span]:w-full [&>span]:text-right">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent 
        dir="rtl"
        side="bottom"
        align="end" 
        avoidCollisions={false}
        sideOffset={6}
        className="rounded-xl border-2 text-right z-[1000] w-[var(--radix-select-trigger-width)] min-w-[250px]"
      >
        <div className="sticky top-0 bg-background border-b p-2 z-50">
          <div className="relative">
            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חפש לפי מספר שלדה, מספר רכב או שם רכב..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 text-right"
              dir="rtl"
            />
          </div>
        </div>
        
        {includeNoneOption && (
          <SelectItem value="none" className="text-right justify-end" dir="rtl">
            <span>ללא רכב</span>
          </SelectItem>
        )}
        
        {filteredCars?.length === 0 && searchQuery ? (
          <div className="p-2 text-center text-muted-foreground text-sm">
            לא נמצאו רכבים תואמים
          </div>
        ) : (
          filteredCars?.map((car) => (
            <SelectItem key={car.id as string} value={car.id as string} className="text-right justify-end" dir="rtl">
              <div className="flex flex-col text-right w-full items-end">
                <span className="font-medium text-right">
                  {car.make as string} {car.model as string} ({car.year as number})
                </span>
                <div className="text-xs text-muted-foreground text-right">
                  <div className="flex flex-col text-right items-end">
                    {car.license_number && <span>רכב: {car.license_number}</span>}
                    {car.chassis_number && <span>שלדה: {car.chassis_number}</span>}
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