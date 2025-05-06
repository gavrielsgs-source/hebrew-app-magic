
import { useState, useEffect } from "react";
import { Car as CarIcon, Edit } from "lucide-react";
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
  return (
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
        onClick={() => onEditClick(car)}
      >
        <Edit className="h-4 w-4 ml-1" />
        ערוך
      </Button>
    </div>
  );
}
