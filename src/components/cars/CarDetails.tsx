import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { Button } from "@/components/ui/button";
import { getCarImages } from "@/lib/image-utils";
import { Separator } from "@/components/ui/separator";
import { Edit } from "lucide-react";
import { EditCarForm } from "./forms/EditCarForm";
import { CarImagesCarousel } from "./details/CarImagesCarousel";
import { CarHeader } from "./details/CarHeader";
import { CarSpecifications } from "./details/CarSpecifications";
import { CarDescription } from "./details/CarDescription";
import { CarAdditionalDetails } from "./details/CarAdditionalDetails";
import { CarTestDate } from "./details/CarTestDate";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CarDetailsProps {
  car: Car;
}

export function CarDetails({ car }: CarDetailsProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoadingImages(true);
        console.log("Fetching images for car:", car.id);
        const imageUrls = await getCarImages(car.id);
        console.log("Fetched images:", imageUrls);
        setImages(imageUrls);
      } catch (error) {
        console.error("Error fetching car images:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchImages();
  }, [car.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <SwipeDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              ערוך רכב
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] sm:w-[600px] overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>עריכת רכב</DialogTitle>
            </DialogHeader>
            <EditCarForm car={car} onCancel={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </SwipeDialog>
      </div>
      
      <CarImagesCarousel 
        images={images} 
        loadingImages={loadingImages} 
        carMake={car.make} 
        carModel={car.model} 
      />
      
      <CarHeader 
        make={car.make} 
        model={car.model} 
        year={car.year}
        price={car.price}
        status={car.status}
      />

      <Separator />
      
      <CarSpecifications
        kilometers={car.kilometers}
        year={car.year}
        transmission={car.transmission}
        fuelType={car.fuel_type}
      />
      
      <CarDescription description={car.description} />
      
      <CarAdditionalDetails
        exteriorColor={car.exterior_color}
        interiorColor={car.interior_color}
        engineSize={car.engine_size}
        registrationYear={car.registration_year}
      />
      
      <CarTestDate lastTestDate={car.last_test_date} />
    </div>
  );
}
