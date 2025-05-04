
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
