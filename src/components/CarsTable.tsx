
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!canAddCar}
            >
              <Plus className="h-4 w-4" /> הוסף רכב חדש
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[90%] sm:w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>הוסף רכב חדש</SheetTitle>
            </SheetHeader>
            <AddCarForm />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">דגם</TableHead>
              <TableHead className="text-right">שנה</TableHead>
              <TableHead className="text-right">ק"מ</TableHead>
              <TableHead className="text-right">מחיר</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
              <TableHead className="text-left">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  טוען...
                </TableCell>
              </TableRow>
            ) : cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  אין רכבים במלאי
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium text-right">{car.make} {car.model}</TableCell>
                  <TableCell className="text-right">{car.year}</TableCell>
                  <TableCell className="text-right">{car.kilometers.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{car.price.toLocaleString()} ₪</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getStatusBadgeColor(car.status)}>
                      {getStatusText(car.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" title="הוסף ליד">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px]">
                          <SheetHeader>
                            <SheetTitle>הוסף ליד חדש</SheetTitle>
                          </SheetHeader>
                          <AddLeadForm carId={car.id} />
                        </SheetContent>
                      </Sheet>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="שלח בוואטסאפ"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => {
                          setSelectedCar(car);
                          setIsWhatsappOpen(true);
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
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
                        size="icon" 
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
            <WhatsappTemplateSelector car={selectedCar} onClose={() => setIsWhatsappOpen(false)} />
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

function getStatusBadgeColor(status: string | null) {
  switch (status) {
    case "available":
      return "bg-green-500 hover:bg-green-600";
    case "reserved":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "sold":
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
}

function getStatusText(status: string | null) {
  switch (status) {
    case "available":
      return "זמין";
    case "reserved":
      return "שמור";
    case "sold":
      return "נמכר";
    default:
      return "לא ידוע";
  }
}
