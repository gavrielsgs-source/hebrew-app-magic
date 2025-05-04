
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Car } from "lucide-react";

interface CarImagesCarouselProps {
  images: string[];
  loadingImages: boolean;
  carMake: string;
  carModel: string;
}

export function CarImagesCarousel({ images, loadingImages, carMake, carModel }: CarImagesCarouselProps) {
  return (
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
                    alt={`${carMake} ${carModel} - תמונה ${index + 1}`} 
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
          <Car className="h-16 w-16 mb-2" />
          <p>אין תמונות זמינות</p>
        </div>
      )}
    </div>
  );
}
