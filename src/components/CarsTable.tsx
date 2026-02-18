import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Share2, Edit, Plus, UserPlus, Send, Eye, MessageCircle } from "lucide-react";
import { useCars } from "@/hooks/use-cars";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddCarForm } from "./cars/AddCarForm";
import { AddLeadForm } from "./leads/AddLeadForm";
import { EditCarForm } from "./cars/forms/EditCarForm";
import { CarStatusChanger } from "./cars/components/CarStatusChanger";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WhatsappTemplateSelector } from "./whatsapp/WhatsappTemplateSelector";
import { CarDetails } from "./cars/CarDetails";
import { useSubscription } from '@/contexts/subscription-context';
import { Car as CarType } from "@/types/car";

export function CarsTable() {
  const { cars, isLoading } = useCars();
  const { checkEntitlement } = useSubscription();
  const canAddCar = checkEntitlement('carLimit', cars.length + 1);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [isWhatsappOpen, setIsWhatsappOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Always derive from live cache so dialogs reflect latest data after updates
  const currentSelectedCar = selectedCar
    ? cars.find(c => c.id === selectedCar.id) ?? selectedCar
    : null;

  return (
    <div dir="rtl">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/20">
              <TableHead className="text-right font-semibold text-primary uppercase tracking-wide py-5 px-8">דגם</TableHead>
              <TableHead className="text-right font-semibold text-primary uppercase tracking-wide py-5 px-8">שנה</TableHead>
              <TableHead className="text-right font-semibold text-primary uppercase tracking-wide py-5 px-8">ק"מ</TableHead>
              <TableHead className="text-right font-semibold text-primary uppercase tracking-wide py-5 px-8">מחיר</TableHead>
              <TableHead className="text-right font-semibold text-primary uppercase tracking-wide py-5 px-8">סטטוס</TableHead>
              <TableHead className="text-right font-semibold text-primary uppercase tracking-wide py-5 px-8">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-b border-gray-100/50">
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-8 w-8 animate-spin text-muted-foreground/50" />
                    <span>טוען רכבים...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-12 w-12 text-muted-foreground/50" />
                    <span>אין רכבים במלאי</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car, index) => (
                <TableRow 
                  key={car.id}
                  className="hover:bg-primary/5 transition-colors border-b border-gray-100/50"
                >
                  <TableCell 
                    className="font-medium text-right py-5 px-8 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      setSelectedCar(car);
                      setIsDetailsOpen(true);
                    }}
                  >
                    {car.make} {car.model}
                  </TableCell>
                  <TableCell className="text-right py-5 px-8">{car.year}</TableCell>
                  <TableCell className="text-right py-5 px-8">{car.kilometers.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-5 px-8 font-semibold">{car.price.toLocaleString()} ₪</TableCell>
                  <TableCell className="text-right py-5 px-8">
                    <CarStatusChanger car={car} compact={true} />
                  </TableCell>
                  <TableCell className="py-5 px-8">
                    <div className="flex items-center gap-2 justify-end">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-primary/10 hover:border-primary/20"
                            title="הוסף ליד"
                          >
                            <UserPlus className="h-4 w-4 ml-1" />
                            הוסף ליד
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px]">
                          <SheetHeader>
                            <SheetTitle>הוסף ליד חדש</SheetTitle>
                          </SheetHeader>
                          <AddLeadForm />
                        </SheetContent>
                      </Sheet>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-primary/10 hover:border-primary/20"
                        title="שלח בוואטסאפ"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsWhatsappOpen(true);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 ml-1" />
                        שלח בוואטסאפ
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="hover:bg-primary/10 hover:border-primary/20"
                        title="צפה בפרטים"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        צפה
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="hover:bg-primary/10 hover:border-primary/20"
                        title="ערוך"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 ml-1" />
                        ערוך
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* WhatsApp Dialog */}
      <Dialog open={isWhatsappOpen} onOpenChange={setIsWhatsappOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>שליחת פרטי רכב בוואטסאפ</DialogTitle>
          </DialogHeader>
          {currentSelectedCar && (
            <WhatsappTemplateSelector 
              selectedTemplateId=""
              customizedTemplate=""
              onTemplateChange={() => {}}
              onCustomizedTemplateChange={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Car Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>פרטי רכב</DialogTitle>
          </DialogHeader>
          {currentSelectedCar && (
            <CarDetails car={currentSelectedCar} />
          )}
        </DialogContent>
      </Dialog>

      {/* Car Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-[90%] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>עריכת רכב</SheetTitle>
          </SheetHeader>
          {currentSelectedCar && (
            <EditCarForm car={currentSelectedCar} onCancel={() => setIsEditOpen(false)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
