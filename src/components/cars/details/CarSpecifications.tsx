
import { Gauge, Calendar, RotateCw, Fuel } from "lucide-react";

interface CarSpecificationsProps {
  kilometers: number;
  year: number;
  transmission: string | null;
  fuelType: string | null;
}

export function CarSpecifications({ kilometers, year, transmission, fuelType }: CarSpecificationsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
        <Gauge className="h-6 w-6 mb-1 text-primary" />
        <span className="text-sm text-muted-foreground">קילומטראז'</span>
        <span className="font-medium">{kilometers.toLocaleString()} ק"מ</span>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
        <Calendar className="h-6 w-6 mb-1 text-primary" />
        <span className="text-sm text-muted-foreground">שנת ייצור</span>
        <span className="font-medium">{year}</span>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
        <RotateCw className="h-6 w-6 mb-1 text-primary" />
        <span className="text-sm text-muted-foreground">תיבת הילוכים</span>
        <span className="font-medium">
          {transmission === 'manual' ? 'ידנית' : 
           transmission === 'automatic' ? 'אוטומטית' : 
           transmission === 'robotics' ? 'רובוטית' : 
           transmission || 'לא צוין'}
        </span>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
        <Fuel className="h-6 w-6 mb-1 text-primary" />
        <span className="text-sm text-muted-foreground">סוג דלק</span>
        <span className="font-medium">
          {fuelType === 'gasoline' ? 'בנזין' : 
           fuelType === 'diesel' ? 'דיזל' : 
           fuelType === 'hybrid' ? 'היברידי' : 
           fuelType === 'electric' ? 'חשמלי' : 
           fuelType || 'לא צוין'}
        </span>
      </div>
    </div>
  );
}
