
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CarImageSection } from "./CarImageSection";
import { CarInfoGrid } from "./CarInfoGrid";
import { CarCardActions } from "./CarCardActions";

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
  return (
    <Card key={car.id} className="overflow-hidden">
      <CarImageSection 
        car={car} 
        loadingImages={loadingImages} 
        carImages={carImages} 
        onEditClick={onEditClick} 
      />
      
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle className="text-lg text-right">
            {car.make} {car.model}
          </CardTitle>
          <Badge>
            {car.status === 'available' ? 'זמין' : 
             car.status === 'sold' ? 'נמכר' : 
             car.status === 'reserved' ? 'שמור' : car.status}
          </Badge>
        </div>
        <CardDescription className="text-right">{car.year}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <CarInfoGrid 
          kilometers={car.kilometers} 
          year={car.year} 
          fuelType={car.fuel_type}
          engineSize={car.engine_size} 
          price={car.price} 
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <CarCardActions 
          car={car} 
          onSendWhatsapp={onSendWhatsapp} 
          onViewDetails={onViewDetails} 
        />
      </CardFooter>
    </Card>
  );
}
