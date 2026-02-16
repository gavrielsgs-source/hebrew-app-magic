
import { Calendar, Gauge, Fuel, Car as CarIcon } from "lucide-react";
import { Car } from "@/types/car";
import { translateTransmission, translateFuelType } from "@/lib/car-translations";

interface CarCardTechnicalDetailsProps {
  car: Car;
  isMobile?: boolean;
}

export function CarCardTechnicalDetails({ car, isMobile = false }: CarCardTechnicalDetailsProps) {
  const gridCols = isMobile ? "grid-cols-2" : "grid-cols-2";
  
  return (
    <div className={`grid ${gridCols} gap-3 md:gap-4`}>
      <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
        <div className="text-sm min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate">{car.kilometers.toLocaleString()}</div>
          <div className="text-xs text-gray-500">קילומטרים</div>
        </div>
        <Gauge className="h-5 w-5 text-brand-primary flex-shrink-0" />
      </div>
      
      <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
        <div className="text-sm min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate">{translateFuelType(car.fuel_type)}</div>
          <div className="text-xs text-gray-500">סוג דלק</div>
        </div>
        <Fuel className="h-5 w-5 text-brand-primary flex-shrink-0" />
      </div>
      
      {car.transmission && (
        <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg col-span-2">
          <div className="text-sm min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{translateTransmission(car.transmission)}</div>
            <div className="text-xs text-gray-500">תיבת הילוכים</div>
          </div>
          <CarIcon className="h-5 w-5 text-brand-primary flex-shrink-0" />
        </div>
      )}

      {car.entry_date && (
        <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
          <div className="text-sm min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{new Date(car.entry_date).toLocaleDateString('he-IL')}</div>
            <div className="text-xs text-gray-500">כניסה למלאי</div>
          </div>
          <Calendar className="h-5 w-5 text-brand-primary flex-shrink-0" />
        </div>
      )}

      {car.next_test_date && (
        <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
          <div className="text-sm min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{new Date(car.next_test_date).toLocaleDateString('he-IL')}</div>
            <div className="text-xs text-gray-500">טסט הבא</div>
          </div>
          <Calendar className="h-5 w-5 text-brand-primary flex-shrink-0" />
        </div>
      )}
    </div>
  );
}
