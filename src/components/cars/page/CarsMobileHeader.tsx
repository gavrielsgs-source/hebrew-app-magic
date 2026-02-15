import { Plus } from "lucide-react";
import { MobileButton } from "@/components/mobile/MobileButton";

interface CarsMobileHeaderProps {
  onAddCar: () => void;
  carsCount: number;
}

export function CarsMobileHeader({
  onAddCar,
  carsCount
}: CarsMobileHeaderProps) {
  return (
    <div className="bg-transparent p-4 rounded-b-xl" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">מלאי רכבים</h1>
          <p className="text-gray-600 text-sm mt-1">
            {carsCount > 0 ? `${carsCount} רכבים במלאי` : 'אין רכבים במלאי'}
          </p>
        </div>
      </div>
      
      {/* כפתור פעולה */}
      <MobileButton
        onClick={onAddCar}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold text-base shadow-md transition-all duration-300"
        icon={<Plus className="h-5 w-5" />}
      >
        הוסף רכב חדש
      </MobileButton>
    </div>
  );
}
