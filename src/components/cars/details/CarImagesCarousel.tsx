import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarImagesCarouselProps {
  images: string[];
  loadingImages: boolean;
  carMake: string;
  carModel: string;
}

export function CarImagesCarousel({ images, loadingImages, carMake, carModel }: CarImagesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-60 sm:h-80 group">
      {loadingImages ? (
        <div className="flex items-center justify-center h-full">
          <Skeleton className="h-full w-full" />
        </div>
      ) : images.length > 0 ? (
        <>
          <img 
            src={images[currentIndex]} 
            alt={`${carMake} ${carModel} - תמונה ${currentIndex + 1}`} 
            className="object-cover h-full w-full transition-all duration-500"
            loading="eager"
          />
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-10 h-10"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg border-0 rounded-full w-10 h-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-white w-6 shadow-md' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`תמונה ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Image counter */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <div className="p-4 bg-white/80 rounded-full mb-3">
            <Car className="h-12 w-12" />
          </div>
          <p className="font-medium">אין תמונות זמינות</p>
          <p className="text-sm text-muted-foreground">{carMake} {carModel}</p>
        </div>
      )}
    </div>
  );
}
