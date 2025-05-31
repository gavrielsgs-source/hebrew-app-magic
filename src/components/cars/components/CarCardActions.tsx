
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Eye, Edit, Phone, MessageCircle } from "lucide-react";
import { Car } from "@/types/car";
import { SwipeDialog } from "@/components/ui/swipe-dialog";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { CarDetails } from "@/components/cars/CarDetails";

interface CarCardActionsProps {
  car: Car;
  onSendWhatsapp: (car: Car) => void;
  onViewDetails: (car: Car) => void;
}

export function CarCardActions({ car, onSendWhatsapp, onViewDetails }: CarCardActionsProps) {
  const [showWhatsappDialog, setShowWhatsappDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const handleWhatsappClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowWhatsappDialog(true);
    onSendWhatsapp(car);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailsDialog(true);
    onViewDetails(car);
  };

  return (
    <>
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

      {/* WhatsApp Dialog */}
      <SwipeDialog open={showWhatsappDialog} onOpenChange={setShowWhatsappDialog}>
        <DialogContent className="w-[95%] sm:w-[600px] overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
          </DialogHeader>
          <WhatsappTemplateSelector 
            car={car} 
            onClose={() => setShowWhatsappDialog(false)}
          />
        </DialogContent>
      </SwipeDialog>

      {/* Car Details Dialog */}
      <SwipeDialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="w-[95%] sm:w-[800px] overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>פרטי הרכב</DialogTitle>
          </DialogHeader>
          <CarDetails car={car} />
        </DialogContent>
      </SwipeDialog>
    </>
  );
}
