
import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Car as CarIcon, Calendar, Fuel, Gauge, Send, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { getCarImages } from "@/lib/image-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CarDetails } from "./CarDetails";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EditCarForm } from "./EditCarForm";

interface CarGridProps {
  cars: Car[];
  isLoading: boolean;
}

export function CarGrid({ cars, isLoading }: CarGridProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [carImages, setCarImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Fetch the first image for each car when the component mounts
  useEffect(() => {
    const fetchFirstImages = async () => {
      if (cars.length === 0) return;
      
      setLoadingImages(true);
      const imagePromises = cars.map(async (car) => {
        try {
          const imageUrls = await getCarImages(car.id);
          return imageUrls.length > 0 ? [car.id, imageUrls[0]] : [car.id, null];
        } catch (error) {
          console.error('Error fetching image for car:', car.id, error);
          return [car.id, null];
        }
      });
      
      const results = await Promise.all(imagePromises);
      const imagesMap: Record<string, string> = {};
      
      results.forEach(([carId, imageUrl]) => {
        if (imageUrl) {
          imagesMap[carId as string] = imageUrl as string;
        }
      });
      
      setCarImages(imagesMap);
      setLoadingImages(false);
    };
    
    fetchFirstImages();
  }, [cars]);
  
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
          <div className="h-48 bg-muted flex items-center justify-center relative">
            {loadingImages ? (
              <Skeleton className="h-full w-full" />
            ) : carImages[car.id] ? (
              <img 
                src={carImages[car.id]} 
                alt={`${car.make} ${car.model}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <CarIcon className="h-24 w-24 text-muted-foreground" />
            )}
            
            {/* כפתור עריכה על התמונה */}
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute top-2 right-2 opacity-80 hover:opacity-100"
              onClick={() => {
                setSelectedCar(car);
                setIsEditOpen(true);
              }}
            >
              <Edit className="h-4 w-4 ml-1" />
              ערוך
            </Button>
          </div>
          
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
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex items-center gap-1 text-sm justify-end">
                {car.kilometers} ק"מ
                <Gauge className="h-4 w-4 text-muted-foreground mr-1" />
              </div>
              
              <div className="flex items-center gap-1 text-sm justify-end">
                שנת {car.year}
                <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
              </div>
              
              <div className="flex items-center gap-1 text-sm justify-end">
                {car.fuel_type || 'לא צוין'}
                <Fuel className="h-4 w-4 text-muted-foreground mr-1" />
              </div>
              
              <div className="flex items-center gap-1 text-sm justify-end">
                {car.engine_size || 'לא צוין'}
                <CarIcon className="h-4 w-4 text-muted-foreground mr-1" />
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
              className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => {
                setSelectedCar(car);
                setIsWhatsappOpen(true);
              }}
            >
              <Send className="h-4 w-4 ml-1" />
              שלח בוואטסאפ
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedCar(car);
                setIsDetailsOpen(true);
              }}
            >
              צפה בפרטים
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {/* WhatsApp Dialog */}
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

      {/* Car Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי רכב</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <CarDetails car={selectedCar} />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Car Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-[90%] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>עריכת רכב</SheetTitle>
          </SheetHeader>
          {selectedCar && (
            <EditCarForm car={selectedCar} onCancel={() => setIsEditOpen(false)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
