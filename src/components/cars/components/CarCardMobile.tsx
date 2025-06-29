
import { Car } from "@/types/car";
import { CarImageSection } from "./CarImageSection";
import { CarCardActions } from "./CarCardActions";
import { CarStatusChanger } from "./CarStatusChanger";
import { CarCardPrice } from "./CarCardPrice";
import { CarCardTechnicalDetails } from "./CarCardTechnicalDetails";
import { MobileCard } from "@/components/mobile/MobileCard";

interface CarCardMobileProps {
  car: Car;
  loadingImages: boolean;
  carImages: Record<string, string>;
  onEditClick: (car: Car) => void;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCardMobile({
  car,
  loadingImages,
  carImages,
  onEditClick,
  onSendWhatsapp,
  onViewDetails
}: CarCardMobileProps) {
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
        <CarCardPrice price={car.price} />
        
        {/* פרטים טכניים */}
        <CarCardTechnicalDetails car={car} isMobile={true} />
        
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
