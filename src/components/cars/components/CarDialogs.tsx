
import { Car } from "@/types/car";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { WhatsappTemplateSelector } from "@/components/whatsapp/WhatsappTemplateSelector";
import { CarDetails } from "../CarDetails";
import { EditCarForm } from "../forms/EditCarForm";

interface CarDialogsProps {
  selectedCar: Car | null;
  isWhatsappOpen: boolean;
  isDetailsOpen: boolean;
  isEditOpen: boolean;
  onWhatsappClose: () => void;
  onDetailsClose: () => void;
  onEditClose: () => void;
}

export function CarDialogs({
  selectedCar,
  isWhatsappOpen,
  isDetailsOpen,
  isEditOpen,
  onWhatsappClose,
  onDetailsClose,
  onEditClose
}: CarDialogsProps) {
  return (
    <>
      {/* WhatsApp Dialog */}
      <Dialog open={isWhatsappOpen} onOpenChange={onWhatsappClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <WhatsappTemplateSelector car={selectedCar} onClose={onWhatsappClose} />
          )}
        </DialogContent>
      </Dialog>

      {/* Car Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={onDetailsClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי רכב</DialogTitle>
          </DialogHeader>
          {selectedCar && (
            <CarDetails car={selectedCar} />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Car Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={onEditClose}>
        <SheetContent className="w-[90%] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>עריכת רכב</SheetTitle>
          </SheetHeader>
          {selectedCar && (
            <EditCarForm car={selectedCar} onCancel={onEditClose} />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
