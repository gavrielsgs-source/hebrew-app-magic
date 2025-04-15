
import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Car as CarIcon, Calendar, Fuel, Gauge, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface CarGridProps {
  cars: Car[];
  isLoading: boolean;
}

export function CarGrid({ cars, isLoading }: CarGridProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [carImages, setCarImages] = useState<Record<string, string>>({});
  
  // Fetch the first image for each car when the component mounts
  useEffect(() => {
    const fetchFirstImages = async () => {
      const imagePromises = cars.map(async (car) => {
        try {
          const { data, error } = await supabase
            .storage
            .from('cars')
            .list(`${car.id}`);
            
          if (error || !data || data.length === 0) {
            return [car.id, null];
          }
          
          // Find the first image file
          const imageFile = data.find(file => 
            file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)
          );
          
          if (!imageFile) return [car.id, null];
          
          const { data: urlData } = await supabase
            .storage
            .from('cars')
            .getPublicUrl(`${car.id}/${imageFile.name}`);
            
          return [car.id, urlData.publicUrl];
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
    };
    
    if (cars.length > 0) {
      fetchFirstImages();
    }
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
            {carImages[car.id] ? (
              <img 
                src={carImages[car.id]} 
                alt={`${car.make} ${car.model}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <CarIcon className="h-24 w-24 text-muted-foreground" />
            )}
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
              className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
              onClick={() => {
                setSelectedCar(car);
                setIsWhatsappOpen(true);
              }}
            >
              <Send className="h-4 w-4" />
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
