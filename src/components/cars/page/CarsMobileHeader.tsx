
import { MobileButton } from "@/components/mobile/MobileButton";
import { Plus, MessageCircle, Filter } from "lucide-react";

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
    <div className="space-y-4" dir="rtl">
      {/* Main header with brand gradient background */}
      <div className="bg-gradient-to-r from-carslead-purple to-carslead-blue rounded-xl p-4 shadow-lg">
        <h1 className="text-lg font-semibold text-white mb-1 text-right">
          ניהול רכבים
        </h1>
        <p className="text-sm text-white/90 text-right">
          {carsCount} רכבים במלאי
        </p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <MobileButton
          variant="primary"
          size="md"
          onClick={onAddCar}
          icon={<Plus className="h-4 w-4" />}
          className="h-12 text-sm font-medium rounded-lg shadow bg-gradient-to-r from-carslead-purple to-carslead-blue hover:from-carslead-purple/90 hover:to-carslead-blue/90"
        >
          רכב חדש
        </MobileButton>
        
        <MobileButton
          variant="success"
          size="md"
          onClick={onWhatsApp}
          icon={<MessageCircle className="h-4 w-4" />}
          className="h-12 text-sm font-medium rounded-lg"
        >
          שלח WhatsApp
        </MobileButton>
        
        <MobileButton
          variant="outline"
          size="md"
          onClick={onFilter}
          icon={<Filter className="h-4 w-4" />}
          className="h-12 text-sm font-medium rounded-lg"
        >
          סינון
        </MobileButton>
      </div>
    </div>
  );
}
