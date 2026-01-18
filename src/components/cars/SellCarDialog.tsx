import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "@/types/car";
import { useCustomers } from "@/hooks/customers";
import { useAddCustomerVehiclePurchase } from "@/hooks/customers/use-customer-vehicles";
import { useUpdateCar } from "@/hooks/cars/use-update-car";
import { toast } from "sonner";
import { Car as CarIcon, User, Calendar, Banknote, Loader2 } from "lucide-react";

interface SellCarDialogProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SellCarDialog({ car, isOpen, onClose, onSuccess }: SellCarDialogProps) {
  const [formData, setFormData] = useState({
    customerId: "",
    salePrice: car.price?.toString() || "",
    saleDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const addPurchase = useAddCustomerVehiclePurchase();
  const updateCar = useUpdateCar();

  // Reset form when dialog opens with new car
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerId: "",
        salePrice: car.price?.toString() || "",
        saleDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen, car.id, car.price]);

  const handleSubmitWithCustomer = async () => {
    if (!formData.customerId) {
      toast.error("יש לבחור לקוח");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add purchase record (this will also update car status to sold)
      await addPurchase.mutateAsync({
        customerId: formData.customerId,
        carId: car.id,
        purchasePrice: parseFloat(formData.salePrice) || undefined,
        purchaseDate: formData.saleDate
      });

      toast.success("הרכב נמכר ללקוח בהצלחה");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error selling car:", error);
      toast.error("שגיאה במכירת הרכב");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      // Just update car status to sold without customer link
      await updateCar.mutateAsync({
        id: car.id,
        make: car.make,
        model: car.model,
        trim_level: car.trim_level,
        year: car.year,
        kilometers: car.kilometers,
        price: car.price,
        description: car.description,
        interior_color: car.interior_color,
        exterior_color: car.exterior_color,
        transmission: car.transmission,
        fuel_type: car.fuel_type,
        engine_size: car.engine_size,
        registration_year: car.registration_year,
        last_test_date: car.last_test_date,
        ownership_history: car.ownership_history,
        status: 'sold',
        agency_id: car.agency_id || null,
        entry_date: car.entry_date,
        license_number: car.license_number,
        chassis_number: car.chassis_number,
        next_test_date: car.next_test_date,
        purchase_cost: car.purchase_cost || null,
        purchase_date: car.purchase_date || null,
        supplier_name: car.supplier_name || null,
      });

      toast.success("סטטוס הרכב עודכן לנמכר");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating car status:", error);
      toast.error("שגיאה בעדכון סטטוס הרכב");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CarIcon className="h-5 w-5 text-primary" />
            מכירת רכב
          </DialogTitle>
          <DialogDescription>
            {car.make} {car.model} {car.year}
            {car.license_number && ` - ${car.license_number}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              בחר לקוח
            </Label>
            <Select 
              value={formData.customerId}
              onValueChange={(value) => setFormData({ ...formData, customerId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={customersLoading ? "טוען לקוחות..." : "בחר לקוח"} />
              </SelectTrigger>
              <SelectContent>
                {customersLoading ? (
                  <SelectItem value="loading" disabled>טוען לקוחות...</SelectItem>
                ) : customers.length === 0 ? (
                  <SelectItem value="empty" disabled>אין לקוחות במערכת</SelectItem>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.full_name}
                      {customer.phone && ` - ${customer.phone}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Sale Price */}
          <div className="space-y-2">
            <Label htmlFor="salePrice" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              מחיר מכירה (₪)
            </Label>
            <Input
              id="salePrice"
              type="number"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          {/* Sale Date */}
          <div className="space-y-2">
            <Label htmlFor="saleDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              תאריך מכירה
            </Label>
            <Input
              id="saleDate"
              type="date"
              value={formData.saleDate}
              onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSubmitWithCustomer}
            disabled={isSubmitting || !formData.customerId}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                שומר...
              </>
            ) : (
              "מכור ללקוח"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                שומר...
              </>
            ) : (
              "סמן כנמכר בלי לקוח"
            )}
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full mt-2"
        >
          ביטול
        </Button>
      </DialogContent>
    </Dialog>
  );
}
