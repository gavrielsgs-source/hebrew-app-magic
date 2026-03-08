
import { useState } from "react";
import { Car as CarIcon, Edit, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCarImages } from "@/hooks/cars/use-car-images";
import { Car } from "@/types/car";

interface CarImageSectionProps {
  car: Car;
  loadingImages: boolean;
  carImages: Record<string, string>;
  onEditClick: (car: Car) => void;
}

export function CarImageSection({ 
  car, 
  loadingImages, 
  carImages, 
  onEditClick 
}: CarImageSectionProps) {
  const { data: allImages = [], isLoading: isLoadingAll } = useCarImages(car.id);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasMultipleImages = allImages.length > 1;
  const safeIndex = currentImageIndex >= allImages.length ? 0 : currentImageIndex;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
      {loadingImages || isLoadingAll ? (
        <div className="w-full h-full">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <ImageIcon className="h-6 w-6 animate-pulse" />
              <span className="text-sm">טוען תמונה...</span>
            </div>
          </div>
        </div>
      ) : allImages.length > 0 ? (
        <div className="relative w-full h-full">
          <img 
            src={allImages[safeIndex]} 
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition-all duration-500"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {hasMultipleImages && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-10 h-10"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-10 h-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === safeIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`תמונה ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 space-y-3">
          <div className="p-4 bg-white/80 rounded-full">
            <CarIcon className="h-12 w-12" />
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-600">אין תמונה</div>
            <div className="text-sm text-gray-500">{car.make} {car.model}</div>
          </div>
        </div>
      )}
      
      <Button 
        variant="secondary" 
        size="sm" 
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full px-3"
        onClick={(e) => {
          e.stopPropagation();
          onEditClick(car);
        }}
      >
        <Edit className="h-4 w-4 ml-1" />
        ערוך
      </Button>
      
      {car.status === 'sold' && (
        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center pointer-events-none">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12">
            נמכר
          </div>
        </div>
      )}
      
      {car.status === 'reserved' && (
        <div className="absolute inset-0 bg-yellow-600/20 flex items-center justify-center pointer-events-none">
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12">
            שמור
          </div>
        </div>
      )}
    </div>
  );
}
