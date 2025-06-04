
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle } from "lucide-react";
import { Car } from "@/types/car";

interface CarCardActionsProps {
  car: Car;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCardActions({ car, onSendWhatsapp, onViewDetails }: CarCardActionsProps) {
  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSendWhatsapp(car);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(car);
  };

  return (
    <div className="flex gap-3 w-full">
      {/* כפתור WhatsApp בולט */}
      <Button 
        className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl font-medium py-3 h-auto"
        onClick={handleWhatsappClick}
      >
        <MessageCircle className="h-4 w-4 ml-2" />
        שלח בוואטסאפ
      </Button>
      
      {/* כפתור צפייה בפרטים */}
      <Button 
        variant="outline" 
        className="flex-1 border-[#2F3C7E] text-[#2F3C7E] hover:bg-[#2F3C7E] hover:text-white rounded-xl font-medium py-3 h-auto"
        onClick={handleDetailsClick}
      >
        <Eye className="h-4 w-4 ml-2" />
        פרטים
      </Button>
    </div>
  );
}
