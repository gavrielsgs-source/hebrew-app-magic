import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Car as CarIcon, Calendar, Gauge, RotateCw, Fuel, AlertTriangle, Edit } from "lucide-react";
import { getCarImages } from "@/lib/image-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EditCarForm } from "./EditCarForm";

interface CarDetailsProps {
  car: Car;
}

export function CarDetails({ car }: CarDetailsProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        const imageUrls = await getCarImages(car.id);
        setImages(imageUrls);
      } catch (error) {
        console.error("Error fetching car images:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [car.id]);

  if (isEditing) {
    return <EditCarForm car={car} onCancel={() => setIsEditing(false)} />;
  }

  function getStatusBadgeColor(status: string | null) {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600";
      case "reserved":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "sold":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  }

  function getStatusText(status: string | null) {
    switch (status) {
      case "available":
        return "זמין";
      case "reserved":
        return "שמור";
      case "sold":
        return "נמכר";
      default:
        return "לא ידוע";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Edit className="h-4 w-4" />
          ערוך רכב
        </Button>
      </div>
      
      {/* Image carousel */}
      <div className="relative rounded-lg overflow-hidden bg-muted h-60 sm:h-80">
        {loadingImages ? (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="h-full w-full" />
          </div>
        ) : images.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {images.map((src, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="flex items-center justify-center h-full">
                    <img 
                      src={src} 
                      alt={`${car.make} ${car.model} - תמונה ${index + 1}`} 
                      className="object-cover h-full w-full"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <CarIcon className="h-16 w-16 mb-2" />
            <p>אין תמונות זמינות</p>
          </div>
        )}
      </div>
      
      {/* Car details */}
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {car.make} {car.model} {car.year}
          </h2>
          <Badge className={getStatusBadgeColor(car.status)}>
            {getStatusText(car.status)}
          </Badge>
        </div>
        
        <div className="text-2xl font-bold mt-2 text-primary">
          {formatPrice(car.price)}
        </div>
      </div>

      <Separator />
      
      {/* Specs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Gauge className="h-6 w-6 mb-1 text-primary" />
          <span className="text-sm text-muted-foreground">קילומטראז'</span>
          <span className="font-medium">{car.kilometers.toLocaleString()} ק"מ</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Calendar className="h-6 w-6 mb-1 text-primary" />
          <span className="text-sm text-muted-foreground">שנת ייצור</span>
          <span className="font-medium">{car.year}</span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <RotateCw className="h-6 w-6 mb-1 text-primary" />
          <span className="text-sm text-muted-foreground">תיבת הילוכים</span>
          <span className="font-medium">
            {car.transmission === 'manual' ? 'ידנית' : 
             car.transmission === 'automatic' ? 'אוטומטית' : 
             car.transmission === 'robotics' ? 'רובוטית' : 
             car.transmission || 'לא צוין'}
          </span>
        </div>
        
        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
          <Fuel className="h-6 w-6 mb-1 text-primary" />
          <span className="text-sm text-muted-foreground">סוג דלק</span>
          <span className="font-medium">
            {car.fuel_type === 'gasoline' ? 'בנזין' : 
             car.fuel_type === 'diesel' ? 'דיזל' : 
             car.fuel_type === 'hybrid' ? 'היברידי' : 
             car.fuel_type === 'electric' ? 'חשמלי' : 
             car.fuel_type || 'לא צוין'}
          </span>
        </div>
      </div>
      
      {/* Additional details */}
      {car.description && (
        <div>
          <h3 className="text-lg font-medium mb-2">תיאור</h3>
          <p className="text-muted-foreground">{car.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium mb-1">צבע חיצוני</h3>
          <p>{car.exterior_color || 'לא צוין'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-1">צבע פנימי</h3>
          <p>{car.interior_color || 'לא צוין'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-1">נפח מנוע</h3>
          <p>{car.engine_size || 'לא צוין'}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-1">שנת עלייה לכביש</h3>
          <p>{car.registration_year || 'לא צוין'}</p>
        </div>
      </div>
      
      {car.last_test_date && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">מועד טסט אחרון</h3>
            <p className="text-amber-700 text-sm">
              {new Date(car.last_test_date).toLocaleDateString('he-IL')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
