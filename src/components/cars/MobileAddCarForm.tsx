
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCar } from "@/hooks/cars/use-add-car";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Car, Calendar, Fuel, Palette, Settings } from "lucide-react";
import { NewCar } from "@/types/car";

interface MobileAddCarFormProps {
  onSuccess?: () => void;
}

export function MobileAddCarForm({ onSuccess }: MobileAddCarFormProps) {
  const { user } = useAuth();
  const addCar = useAddCar();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    price: "",
    kilometers: "",
    exterior_color: "",
    interior_color: "",
    transmission: "אוטומטית",
    fuel_type: "בנזין",
    engine_size: "",
    description: "",
    registration_year: "",
    last_test_date: "",
    ownership_history: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.make || !formData.model) {
      toast({
        title: "שגיאה",
        description: "יש למלא יצרן ודגם",
        variant: "destructive",
      });
      return;
    }

    try {
      const carData: NewCar = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: formData.price ? parseInt(formData.price) : 0,
        kilometers: formData.kilometers ? parseInt(formData.kilometers) : 0,
        exterior_color: formData.exterior_color || null,
        interior_color: formData.interior_color || null,
        transmission: formData.transmission || null,
        fuel_type: formData.fuel_type || null,
        engine_size: formData.engine_size || null,
        description: formData.description || null,
        registration_year: formData.registration_year ? parseInt(formData.registration_year) : null,
        last_test_date: formData.last_test_date || null,
        ownership_history: formData.ownership_history || null,
        status: "available",
        agency_id: null
      };

      await addCar.mutateAsync(carData);
      
      toast({
        title: "רכב נוסף",
        description: "הרכב נוסף בהצלחה למלאי",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("שגיאה בהוספת רכב:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להוסיף את הרכב",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      {/* Make & Model */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="make" className="text-sm font-medium flex items-center gap-2">
            <Car className="h-4 w-4" />
            יצרן *
          </Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            placeholder="טויוטה"
            className="h-11 text-right"
            dir="rtl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm font-medium">
            דגם *
          </Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="קורולה"
            className="h-11 text-right"
            dir="rtl"
            required
          />
        </div>
      </div>

      {/* Year & Price */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            שנה
          </Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            min="1980"
            max={new Date().getFullYear() + 1}
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            מחיר (₪)
          </Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="120000"
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* Kilometers & Exterior Color */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="kilometers" className="text-sm font-medium">
            קילומטראז'
          </Label>
          <Input
            id="kilometers"
            type="number"
            value={formData.kilometers}
            onChange={(e) => setFormData({ ...formData, kilometers: e.target.value })}
            placeholder="50000"
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exterior_color" className="text-sm font-medium flex items-center gap-2">
            <Palette className="h-4 w-4" />
            צבע חיצוני
          </Label>
          <Input
            id="exterior_color"
            value={formData.exterior_color}
            onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
            placeholder="שחור"
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* Transmission & Fuel */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            תיבת הילוכים
          </Label>
          <Select value={formData.transmission} onValueChange={(value) => setFormData({ ...formData, transmission: value })}>
            <SelectTrigger className="h-11" dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="אוטומטית">אוטומטית</SelectItem>
              <SelectItem value="ידנית">ידנית</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            סוג דלק
          </Label>
          <Select value={formData.fuel_type} onValueChange={(value) => setFormData({ ...formData, fuel_type: value })}>
            <SelectTrigger className="h-11" dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="בנזין">בנזין</SelectItem>
              <SelectItem value="דיזל">דיזל</SelectItem>
              <SelectItem value="היברידי">היברידי</SelectItem>
              <SelectItem value="חשמלי">חשמלי</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Engine Size */}
      <div className="space-y-2">
        <Label htmlFor="engine" className="text-sm font-medium">
          נפח מנוע
        </Label>
        <Input
          id="engine"
          value={formData.engine_size}
          onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
          placeholder="1.6L"
          className="h-11 text-right"
          dir="rtl"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          תיאור נוסף
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="פרטים נוספים על הרכב..."
          className="min-h-[80px] text-right"
          dir="rtl"
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
        disabled={addCar.isPending}
      >
        {addCar.isPending ? "מוסיף..." : "הוסף רכב"}
      </Button>
    </form>
  );
}
