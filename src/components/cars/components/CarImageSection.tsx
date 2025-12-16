
import { useState, useEffect } from "react";
import { Car as CarIcon, Edit, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCarImages } from "@/lib/image-utils";
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
  const [allImages, setAllImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [imageErrorCount, setImageErrorCount] = useState(0);
  const MAX_IMAGE_RETRIES = 3;

  // Fetch all images when component mounts
  useEffect(() => {
    const fetchAllImages = async () => {
      setIsLoadingAll(true);
      setImageErrorCount(0); // Reset error count on new car
      try {
        const images = await getCarImages(car.id);
        setAllImages(images);
      } catch (error) {
        console.error("Error fetching all images:", error);
      } finally {
        setIsLoadingAll(false);
      }
    };
    
    fetchAllImages();
  }, [car.id]);

  const hasMultipleImages = allImages.length > 1;

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
            src={allImages[currentImageIndex]} 
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition-all duration-500"
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              if (imageErrorCount < MAX_IMAGE_RETRIES) {
                console.warn(`Image load failed (attempt ${imageErrorCount + 1}/${MAX_IMAGE_RETRIES})`);
                setImageErrorCount(prev => prev + 1);
                const target = e.currentTarget;
                target.style.display = 'none';
                // Try to load next image if available
                if (allImages.length > 1) {
                  const nextIndex = (currentImageIndex + 1) % allImages.length;
                  setCurrentImageIndex(nextIndex);
                }
              }
            }}
          />
          {/* אפקט הצללה עדין */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Navigation buttons for multiple images */}
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
              
              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
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
      
      {/* כפתור עריכה מעוצב */}
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
      
      {/* אינדיקטור סטטוס על התמונה */}
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