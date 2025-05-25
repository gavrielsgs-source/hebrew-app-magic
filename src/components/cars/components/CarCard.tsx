
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CarImageSection } from "./CarImageSection";
import { CarInfoGrid } from "./CarInfoGrid";
import { CarCardActions } from "./CarCardActions";
import { formatPrice } from "@/lib/utils";
import { Calendar, Gauge, Fuel, Car as CarIcon, MapPin } from "lucide-react";

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
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'זמין';
      case 'sold':
        return 'נמכר';
      case 'reserved':
        return 'שמור';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg bg-white rounded-2xl">
      <CarImageSection 
        car={car} 
        loadingImages={loadingImages} 
        carImages={carImages} 
        onEditClick={onEditClick} 
      />
      
      <CardHeader className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="text-right">
            <CardTitle className="text-xl font-bold text-[#2F3C7E] mb-1">
              {car.make} {car.model}
            </CardTitle>
            <CardDescription className="text-lg font-medium text-gray-600">
              שנת {car.year}
            </CardDescription>
          </div>
          <Badge className={`${getStatusColor(car.status)} font-medium px-3 py-1 rounded-full`}>
            {getStatusText(car.status)}
          </Badge>
        </div>
        
        {/* מחיר בולט */}
        <div className="text-center bg-gradient-to-l from-blue-50 to-white p-4 rounded-xl border border-blue-100">
          <div className="text-3xl font-bold text-[#2F3C7E]">
            {formatPrice(car.price)}
          </div>
          <div className="text-sm text-gray-500 mt-1">מחיר מבוקש</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        {/* פרטים טכניים בעיצוב משופר */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{car.kilometers.toLocaleString()}</div>
              <div className="text-xs text-gray-500">קילומטרים</div>
            </div>
            <Gauge className="h-5 w-5 text-[#2F3C7E]" />
          </div>
          
          <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{car.fuel_type || 'לא צוין'}</div>
              <div className="text-xs text-gray-500">סוג דלק</div>
            </div>
            <Fuel className="h-5 w-5 text-[#2F3C7E]" />
          </div>
          
          {car.transmission && (
            <div className="flex items-center gap-2 text-right bg-gray-50 p-3 rounded-lg col-span-2">
              <div className="text-sm">
                <div className="font-medium text-gray-900">{car.transmission}</div>
                <div className="text-xs text-gray-500">תיבת הילוכים</div>
              </div>
              <CarIcon className="h-5 w-5 text-[#2F3C7E]" />
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
      
      <CardFooter className="p-6 pt-0">
        <CarCardActions 
          car={car} 
          onSendWhatsapp={onSendWhatsapp} 
          onViewDetails={onViewDetails} 
        />
      </CardFooter>
    </Card>
  );
}
