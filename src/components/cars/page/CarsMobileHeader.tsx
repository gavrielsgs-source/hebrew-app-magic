
import { Filter, MessageSquare, Plus } from "lucide-react";
import { MobileButton } from "@/components/mobile/MobileButton";

interface CarsMobileHeaderProps {
  onAddCar: () => void;
  onWhatsApp: () => void;
  onFilter: () => void;
  carsCount: number;
}

export function CarsMobileHeader({
  onAddCar,
  onWhatsApp,
  onFilter,
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
      
      {/* כפתורי פעולה */}
      <div className="grid grid-cols-3 gap-2">
        <MobileButton
          onClick={onAddCar}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-10 rounded-xl font-semibold text-sm shadow-md transition-all duration-300"
          icon={<Plus className="h-4 w-4" />}
        >
          הוסף רכב
        </MobileButton>
        
        <MobileButton
          onClick={onWhatsApp}
          className="bg-success/90 text-success-foreground hover:bg-success h-10 rounded-xl font-semibold text-sm shadow-md transition-all duration-300"
          icon={<MessageSquare className="h-4 w-4" />}
        >
          וואטסאפ
        </MobileButton>

        <MobileButton
          onClick={onFilter}
          className="bg-warning/90 text-warning-foreground hover:bg-warning h-10 rounded-xl font-semibold text-sm shadow-md transition-all duration-300"
          icon={<Filter className="h-4 w-4" />}
        >
          סינון
        </MobileButton>
      </div>
    </div>
  );
}
