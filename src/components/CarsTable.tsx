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
import { Car, Share2, Edit, Plus, UserPlus, Send, Eye } from "lucide-react";
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

  return (
    <div dir="rtl">
      <div className="rounded-md border border-border/40">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40">
              <TableHead className="text-right font-medium h-12">דגם</TableHead>
              <TableHead className="text-right font-medium h-12">שנה</TableHead>
              <TableHead className="text-right font-medium h-12">ק"מ</TableHead>
              <TableHead className="text-right font-medium h-12">מחיר</TableHead>
              <TableHead className="text-right font-medium h-12">סטטוס</TableHead>
              <TableHead className="text-right font-medium h-12">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-16">
                  טוען...
                </TableCell>
              </TableRow>
            ) : cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-16">
                  אין רכבים במלאי
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car, index) => (
                <TableRow 
                  key={car.id}
                  className={`
                    border-border/40 h-16
                    ${index % 2 === 0 ? 'bg-muted/20' : 'bg-background'}
                    hover:bg-muted/40 transition-colors
                  `}
                >
                  <TableCell className="font-medium text-right py-4">
                    {car.make} {car.model}
                  </TableCell>
                  <TableCell className="text-right py-4">{car.year}</TableCell>
                  <TableCell className="text-right py-4">{car.kilometers.toLocaleString()}</TableCell>
                  <TableCell className="text-right py-4 font-medium">{car.price.toLocaleString()} ₪</TableCell>
                  <TableCell className="text-right py-4">
                    <CarStatusChanger car={car} compact={true} />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                            title="הוסף ליד"
                          >
                            <UserPlus className="h-4 w-4" />
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
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="שלח בוואטסאפ"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsWhatsappOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        title="צפה בפרטים"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsDetailsOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        title="ערוך"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
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
          {selectedCar && (
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
          {selectedCar && (
            <CarDetails car={selectedCar} />
          )}
        </DialogContent>
      </Dialog>

      {/* Car Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-[90%] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>עריכת רכב</SheetTitle>
          </SheetHeader>
          {selectedCar && (
            <EditCarForm car={selectedCar} onCancel={() => setIsEditOpen(false)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
