
import { useState, useEffect } from "react";
import { Car as CarIcon, Edit, Image as ImageIcon } from "lucide-react";
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
    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
      {loadingImages ? (
        <div className="w-full h-full">
          <Skeleton className="h-full w-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-500">
              <ImageIcon className="h-6 w-6 animate-pulse" />
              <span className="text-sm">טוען תמונה...</span>
            </div>
          </div>
        </div>
      ) : carImages[car.id] ? (
        <div className="relative w-full h-full">
          <img 
            src={carImages[car.id]} 
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* אפקט הצללה עדין */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
        <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12">
            נמכר
          </div>
        </div>
      )}
      
      {car.status === 'reserved' && (
        <div className="absolute inset-0 bg-yellow-600/20 flex items-center justify-center">
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12">
            שמור
          </div>
        </div>
      )}
    </div>
  );
}
