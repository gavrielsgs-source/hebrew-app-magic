import { useState } from "react";
import { Plus, Car } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    carId: "",
    price: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement add vehicle transaction mutation
      console.log("Adding vehicle transaction:", { 
        customerId, 
        type, 
        ...formData 
      });
      
      const actionText = type === 'purchase' ? 'מכירה' : 'רכישה';
      toast.success(`${actionText} נוספה בהצלחה`);
      setIsOpen(false);
      onSuccess?.();
      setFormData({
        carId: "",
        price: "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error adding vehicle transaction:", error);
      const actionText = type === 'purchase' ? 'במכירה' : 'ברכישה';
      toast.error(`שגיאה ${actionText}`);
    } finally {
      setIsLoading(false);
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
                <SelectValue placeholder="בחר רכב מהמלאי" />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: Load cars from database */}
                <SelectItem value="demo1">טויוטה קורולה 2020</SelectItem>
                <SelectItem value="demo2">הונדה סיוויק 2019</SelectItem>
                <SelectItem value="demo3">מאזדה 3 2021</SelectItem>
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
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "שומר..." : buttonText}
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