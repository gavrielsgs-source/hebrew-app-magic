
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Car as CarIcon, Calendar, Fuel, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";

interface CarGridProps {
  cars: Car[];
  isLoading: boolean;
}

export function CarGrid({ cars, isLoading }: CarGridProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  
  if (isLoading) {
    return <div className="text-center p-4">טוען רכבים...</div>;
  }
  
  if (cars.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">אין רכבים להצגה</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden">
          <div className="h-48 bg-muted flex items-center justify-center">
            {/* כאן יכנסו תמונות בהמשך */}
            <CarIcon className="h-24 w-24 text-muted-foreground" />
          </div>
          
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="text-lg">
                {car.make} {car.model}
              </CardTitle>
              <Badge>
                {car.status === 'available' ? 'זמין' : 
                 car.status === 'sold' ? 'נמכר' : 
                 car.status === 'reserved' ? 'שמור' : car.status}
              </Badge>
            </div>
            <CardDescription>{car.year}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-1 text-sm">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                {car.kilometers} ק"מ
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                שנת {car.year}
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <Fuel className="h-4 w-4 text-muted-foreground" />
                {car.fuel_type || 'לא צוין'}
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <CarIcon className="h-4 w-4 text-muted-foreground" />
                {car.engine_size || 'לא צוין'}
              </div>
            </div>
            
            <div className="text-xl font-bold text-center mt-2">
              {formatPrice(car.price)}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedCar(car);
                setIsWhatsappOpen(true);
              }}
            >
              שלח בוואטסאפ
            </Button>
            
            <Button variant="outline" size="sm">
              צפה בפרטים
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      <Dialog open={isWhatsappOpen} onOpenChange={setIsWhatsappOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <WhatsappTemplateSelector car={selectedCar} onClose={() => setIsWhatsappOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
