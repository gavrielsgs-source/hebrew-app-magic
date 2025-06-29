
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CarImageSection } from "./CarImageSection";
import { CarCardActions } from "./CarCardActions";
import { CarStatusChanger } from "./CarStatusChanger";
import { CarCardPrice } from "./CarCardPrice";
import { CarCardTechnicalDetails } from "./CarCardTechnicalDetails";

interface CarCardDesktopProps {
  car: Car;
  loadingImages: boolean;
  carImages: Record<string, string>;
  onEditClick: (car: Car) => void;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCardDesktop({
  car,
  loadingImages,
  carImages,
  onEditClick,
  onSendWhatsapp,
  onViewDetails
}: CarCardDesktopProps) {
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
        <CarCardPrice price={car.price} />
      </CardHeader>
      
      <CardContent className="p-6 pt-0 flex-1 flex flex-col">
        {/* פרטים טכניים בעיצוב משופר */}
        <div className="flex-1">
          <CarCardTechnicalDetails car={car} />
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
