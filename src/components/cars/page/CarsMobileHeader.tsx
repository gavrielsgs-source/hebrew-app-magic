
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
    <div className="sticky top-0 z-10 bg-carslead-gradient text-white p-6 rounded-b-3xl shadow-xl border-b border-white/20" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">מלאי רכבים</h1>
          <p className="text-blue-100 text-base mt-1">
            {carsCount > 0 ? `${carsCount} רכבים במלאי` : 'אין רכבים במלאי'}
          </p>
        </div>
      </div>
      
      {/* כפתורי פעולה */}
      <div className="grid grid-cols-3 gap-3">
        <MobileButton
          onClick={onAddCar}
          className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 h-14 rounded-2xl font-bold text-base shadow-lg transition-all duration-300"
          icon={<Plus className="h-5 w-5" />}
        >
          הוסף רכב
        </MobileButton>
        
        <MobileButton
          onClick={onWhatsApp}
          className="bg-green-500/90 backdrop-blur-sm border-green-400/30 text-white hover:bg-green-600/90 h-14 rounded-2xl font-bold text-base shadow-lg transition-all duration-300"
          icon={<MessageSquare className="h-5 w-5" />}
        >
          וואטסאפ
        </MobileButton>

        <MobileButton
          onClick={onFilter}
          className="bg-orange-500/90 backdrop-blur-sm border-orange-400/30 text-white hover:bg-orange-600/90 h-14 rounded-2xl font-bold text-base shadow-lg transition-all duration-300"
          icon={<Filter className="h-5 w-5" />}
        >
          סינון
        </MobileButton>
      </div>
    </div>
  );
}
