
import { useState, useEffect } from "react";
import { Car } from "@/types/car";
import { CarCard } from "./components/CarCard";
import { CarDialogs } from "./components/CarDialogs";
import { CarGridEmpty } from "./components/CarGridEmpty";
import { CarGridSkeleton } from "./components/CarGridSkeleton";
import { getCarImages } from "@/lib/image-utils";

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
  
  const handleEditClick = (car: Car) => {
    setSelectedCar(car);
    setIsEditOpen(true);
  };
  
  const handleSendWhatsapp = (car: Car) => {
    setSelectedCar(car);
    setIsWhatsappOpen(true);
  };
  
  const handleViewDetails = (car: Car) => {
    setSelectedCar(car);
    setIsDetailsOpen(true);
  };
  
  if (isLoading) {
    return <CarGridSkeleton />;
  }
  
  if (cars.length === 0) {
    return <CarGridEmpty />;
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            loadingImages={loadingImages}
            carImages={carImages}
            onEditClick={handleEditClick}
            onSendWhatsapp={handleSendWhatsapp}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>
      
      <CarDialogs
        selectedCar={selectedCar}
        isWhatsappOpen={isWhatsappOpen}
        isDetailsOpen={isDetailsOpen}
        isEditOpen={isEditOpen}
        onWhatsappClose={() => setIsWhatsappOpen(false)}
        onDetailsClose={() => setIsDetailsOpen(false)}
        onEditClose={() => setIsEditOpen(false)}
      />
    </>
  );
}
