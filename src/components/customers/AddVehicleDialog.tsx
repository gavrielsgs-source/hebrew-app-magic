import { useState } from "react";
import { Plus, Car } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useGetCars } from "@/hooks/cars";
import { useAddCustomerVehiclePurchase, useAddCustomerVehicleSale } from "@/hooks/customers";

interface AddVehicleDialogProps {
  customerId: string;
  type: 'purchase' | 'sale';
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AddVehicleDialog({ 
  customerId, 
  type,
  onSuccess,
  trigger 
}: AddVehicleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    carId: "",
    price: "",
    date: new Date().toISOString().split('T')[0]
  });

  const { data: cars = [], isLoading: carsLoading } = useGetCars();
  const addPurchase = useAddCustomerVehiclePurchase();
  const addSale = useAddCustomerVehicleSale();

  const availableCars = cars.filter(car => car.status === 'available');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.carId) {
      toast.error("יש לבחור רכב");
      return;
    }

    try {
      if (type === 'purchase') {
        await addPurchase.mutateAsync({
          customerId,
          carId: formData.carId,
          purchasePrice: parseFloat(formData.price) || undefined,
          purchaseDate: formData.date
        });
      } else {
        await addSale.mutateAsync({
          customerId,
          carId: formData.carId,
          salePrice: parseFloat(formData.price) || undefined,
          saleDate: formData.date
        });
      }
      
      setIsOpen(false);
      onSuccess?.();
      setFormData({
        carId: "",
        price: "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const title = type === 'purchase' ? 'מכירת רכב ללקוח' : 'רכישת רכב מהלקוח';
  const buttonText = type === 'purchase' ? 'רשום מכירה' : 'רשום רכישה';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 ml-2" />
            הוסף רכב
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Car className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            הוסף עסקת רכב עבור הלקוח
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="carId">בחר רכב</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, carId: value })} required>
              <SelectTrigger>
                <SelectValue placeholder={carsLoading ? "טוען רכבים..." : "בחר רכב מהמלאי"} />
              </SelectTrigger>
              <SelectContent>
                {carsLoading ? (
                  <SelectItem value="loading" disabled>טוען רכבים...</SelectItem>
                ) : availableCars.length === 0 ? (
                  <SelectItem value="empty" disabled>אין רכבים זמינים במלאי</SelectItem>
                ) : (
                  availableCars.map((car) => (
                    <SelectItem key={car.id} value={car.id}>
                      {car.make} {car.model} {car.year} - ₪{car.price.toLocaleString()}
                      {car.license_number && ` (${car.license_number})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">מחיר (₪)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                min="0"
                step="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">תאריך העסקה</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={addPurchase.isPending || addSale.isPending || !formData.carId} 
              className="flex-1"
            >
              {(addPurchase.isPending || addSale.isPending) ? "שומר..." : buttonText}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}