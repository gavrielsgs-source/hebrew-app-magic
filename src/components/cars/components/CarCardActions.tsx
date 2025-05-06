
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Car } from "@/types/car";

interface CarCardActionsProps {
  car: Car;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCardActions({ car, onSendWhatsapp, onViewDetails }: CarCardActionsProps) {
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50"
        onClick={() => onSendWhatsapp(car)}
      >
        <Send className="h-4 w-4 ml-1" />
        שלח בוואטסאפ
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onViewDetails(car)}
      >
        צפה בפרטים
      </Button>
    </>
  );
}
