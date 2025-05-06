
import { Gauge, Calendar, Fuel, Car as CarIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CarInfoGridProps {
  kilometers: number;
  year: number;
  fuelType?: string | null;
  engineSize?: string | null;
  price: number;
}

export function CarInfoGrid({ 
  kilometers, 
  year, 
  fuelType, 
  engineSize, 
  price 
}: CarInfoGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-1 text-sm justify-end">
          {kilometers} ק"מ
          <Gauge className="h-4 w-4 text-muted-foreground mr-1" />
        </div>
        
        <div className="flex items-center gap-1 text-sm justify-end">
          שנת {year}
          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
        </div>
        
        <div className="flex items-center gap-1 text-sm justify-end">
          {fuelType || 'לא צוין'}
          <Fuel className="h-4 w-4 text-muted-foreground mr-1" />
        </div>
        
        <div className="flex items-center gap-1 text-sm justify-end">
          {engineSize || 'לא צוין'}
          <CarIcon className="h-4 w-4 text-muted-foreground mr-1" />
        </div>
      </div>
      
      <div className="text-xl font-bold text-center mt-2">
        {formatPrice(price)}
      </div>
    </>
  );
}
