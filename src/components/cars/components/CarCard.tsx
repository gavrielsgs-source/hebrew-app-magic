
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarImageSection } from "./CarImageSection";
import { CarInfoGrid } from "./CarInfoGrid";
import { CarCardActions } from "./CarCardActions";
import { CarStatusChanger } from "./CarStatusChanger";
import { formatPrice } from "@/lib/utils";
import { Calendar, Gauge, Fuel, Car as CarIcon, MapPin } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard } from "@/components/mobile/MobileCard";

interface CarCardProps {
  car: Car;
  loadingImages: boolean;
  carImages: Record<string, string>;
  onEditClick: (car: Car) => void;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCard({
  car,
  loadingImages,
  carImages,
  onEditClick,
  onSendWhatsapp,
  onViewDetails
}: CarCardProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileCard className="overflow-hidden">
        <CarImageSection 
          car={car} 
          loadingImages={loadingImages} 
          carImages={carImages} 
          onEditClick={onEditClick} 
        />
        
        <div className="p-6 space-y-4">
          {/* כותרת וסטטוס */}
          <div className="flex justify-between items-start">
            <div className="text-right min-w-0 flex-1">
              <h3 className="text-xl font-bold text-[#2F3C7E] mb-1 truncate">
                {car.make} {car.model}
              </h3>
              <p className="text-base text-gray-600">
                שנת {car.year}
              </p>
              {car.license_number && (
                <p className="text-sm text-gray-500">
                  רישוי: {car.license_number}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <CarStatusChanger car={car} compact={true} />
            </div>
          </div>
          
          {/* מחיר בולט */}
          <div className="text-center bg-gradient-to-l from-blue-50 to-white p-4 rounded-xl border border-blue-100">
            <div className="text-2xl font-bold text-[#2F3C7E]">
              {formatPrice(car.price)}
            </div>
            <div className="text-sm text-gray-500 mt-1">מחיר מבוקש</div>
          </div>
          
          {/* פרטים טכניים */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
              <div className="text-sm min-w-0 flex-1">
                <div className="font-medium text-gray-900">{car.kilometers.toLocaleString()}</div>
                <div className="text-xs text-gray-500">קילומטרים</div>
              </div>
              <Gauge className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
            </div>
            
            <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
              <div className="text-sm min-w-0 flex-1">
                <div className="font-medium text-gray-900">{car.fuel_type || 'לא צוין'}</div>
                <div className="text-xs text-gray-500">סוג דלק</div>
              </div>
              <Fuel className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
            </div>
            
            {car.transmission && (
              <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg col-span-2">
                <div className="text-sm min-w-0 flex-1">
                  <div className="font-medium text-gray-900">{car.transmission}</div>
                  <div className="text-xs text-gray-500">תיבת הילוכים</div>
                </div>
                <CarIcon className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
              </div>
            )}

            {/* New fields display */}
            {car.entry_date && (
              <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
                <div className="text-sm min-w-0 flex-1">
                  <div className="font-medium text-gray-900">{new Date(car.entry_date).toLocaleDateString('he-IL')}</div>
                  <div className="text-xs text-gray-500">כניסה למלאי</div>
                </div>
                <Calendar className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
              </div>
            )}

            {car.next_test_date && (
              <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
                <div className="text-sm min-w-0 flex-1">
                  <div className="font-medium text-gray-900">{new Date(car.next_test_date).toLocaleDateString('he-IL')}</div>
                  <div className="text-xs text-gray-500">טסט הבא</div>
                </div>
                <Calendar className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
              </div>
            )}
          </div>
          
          {/* תיאור קצר */}
          {car.description && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700 text-right line-clamp-2">
                {car.description}
              </p>
            </div>
          )}
          
          {/* כפתורי פעולה */}
          <CarCardActions 
            car={car} 
            onSendWhatsapp={onSendWhatsapp} 
            onViewDetails={onViewDetails} 
          />
        </div>
      </MobileCard>
    );
  }

  // Desktop version
  return (
    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white rounded-2xl flex flex-col">
      <CarImageSection 
        car={car} 
        loadingImages={loadingImages} 
        carImages={carImages} 
        onEditClick={onEditClick} 
      />
      
      <CardHeader className="p-6 pb-4 flex-shrink-0">
        <div className="flex justify-between items-start mb-3">
          <div className="text-right min-w-0 flex-1">
            <CardTitle className="text-xl font-bold text-[#2F3C7E] mb-1 truncate">
              {car.make} {car.model}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-gray-600">
              שנת {car.year}
            </CardDescription>
            {car.license_number && (
              <CardDescription className="text-sm text-gray-500">
                רישוי: {car.license_number}
              </CardDescription>
            )}
          </div>
          <div className="flex-shrink-0 ml-2">
            <CarStatusChanger car={car} compact={true} />
          </div>
        </div>
        
        {/* מחיר בולט */}
        <div className="text-center bg-gradient-to-l from-blue-50 to-white p-4 rounded-xl border border-blue-100">
          <div className="text-3xl font-bold text-[#2F3C7E] truncate">
            {formatPrice(car.price)}
          </div>
          <div className="text-sm text-gray-500 mt-1">מחיר מבוקש</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        {/* פרטים טכניים בעיצוב משופר */}
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{car.kilometers.toLocaleString()}</div>
              <div className="text-xs text-gray-500">קילומטרים</div>
            </div>
            <Gauge className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
          </div>
          
          <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
            <div className="text-sm min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">{car.fuel_type || 'לא צוין'}</div>
              <div className="text-xs text-gray-500">סוג דלק</div>
            </div>
            <Fuel className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
          </div>
          
          {car.transmission && (
            <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg col-span-2">
              <div className="text-sm min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{car.transmission}</div>
                <div className="text-xs text-gray-500">תיבת הילוכים</div>
              </div>
              <CarIcon className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
            </div>
          )}

          {/* New fields display */}
          {car.entry_date && (
            <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
              <div className="text-sm min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{new Date(car.entry_date).toLocaleDateString('he-IL')}</div>
                <div className="text-xs text-gray-500">כניסה למלאי</div>
              </div>
              <Calendar className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
            </div>
          )}

          {car.next_test_date && (
            <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
              <div className="text-sm min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">{new Date(car.next_test_date).toLocaleDateString('he-IL')}</div>
                <div className="text-xs text-gray-500">טסט הבא</div>
              </div>
              <Calendar className="h-5 w-5 text-[#2F3C7E] flex-shrink-0" />
            </div>
          )}
        </div>
        
        {/* תיאור קצר אם קיים */}
        {car.description && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700 text-right line-clamp-2">
              {car.description}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 flex-shrink-0">
        <CarCardActions 
          car={car} 
          onSendWhatsapp={onSendWhatsapp} 
          onViewDetails={onViewDetails} 
        />
      </CardFooter>
    </Card>
  );
}
