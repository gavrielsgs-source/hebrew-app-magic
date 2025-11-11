
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddCar } from "@/hooks/cars/use-add-car";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Car, Calendar, Fuel, Palette, Settings, FileText, Hash } from "lucide-react";
import { NewCar } from "@/types/car";
import { useTasks } from "@/hooks/use-tasks";
import { ImageUploadInput } from "@/components/cars/ImageUploadInput";

interface MobileAddCarFormProps {
  onSuccess?: () => void;
}

export function MobileAddCarForm({ onSuccess }: MobileAddCarFormProps) {
  const { user } = useAuth();
  const addCar = useAddCar();
  const { addTask } = useTasks();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    trim_level: "",
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
    ownership_history: "",
    // New fields
    entry_date: "",
    license_number: "",
    chassis_number: "",
    next_test_date: ""
  });

  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (files: FileList | null) => {
    if (files) {
      setImages(Array.from(files));
    } else {
      setImages([]);
    }
  };

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
      // Helper function to parse price with comma support
      const parsePrice = (priceStr: string): number => {
        if (!priceStr) return 0;
        // Remove commas and convert to number
        return parseInt(priceStr.replace(/,/g, ''));
      };

      const carData: NewCar = {
        make: formData.make,
        model: formData.model,
        trim_level: null,
        year: formData.year,
        price: parsePrice(formData.price),
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
        agency_id: null,
        // New fields
        entry_date: formData.entry_date || null,
        license_number: formData.license_number || null,
        chassis_number: formData.chassis_number || null,
        next_test_date: formData.next_test_date || null,
        purchase_cost: null,
        purchase_date: null,
        supplier_name: null,
        // Images
        images: images.length > 0 ? images : undefined,
      };

      const newCar = await addCar.mutateAsync(carData);

      // Create task for next test date if provided
      if (formData.next_test_date && newCar) {
        try {
          await addTask.mutateAsync({
            title: `טסט לרכב ${formData.make} ${formData.model}`,
            description: `תאריך טסט לרכב ${formData.make} ${formData.model} (${formData.year}) - מספר רישוי: ${formData.license_number || 'לא צוין'}`,
            due_date: new Date(formData.next_test_date).toISOString(),
            type: 'test',
            priority: 'high',
            status: 'pending',
            car_id: newCar.id,
            assigned_to: null,
            agency_id: null,
          });
        } catch (taskError) {
          console.error("Error creating test task:", taskError);
        }
      }
      
      // Don't show toast here - let useAddCar handle success notification
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
            type="text"
            value={formData.price}
            onChange={(e) => {
              // Allow only digits and commas
              const value = e.target.value.replace(/[^0-9,]/g, '');
              setFormData({ ...formData, price: value });
            }}
            placeholder="120,000 או 120000"
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* License Number & Chassis Number */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="license_number" className="text-sm font-medium flex items-center gap-2">
            <Hash className="h-4 w-4" />
            מספר רישוי
          </Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
            placeholder="123-45-678"
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="chassis_number" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            מספר שלדה
          </Label>
          <Input
            id="chassis_number"
            value={formData.chassis_number}
            onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
            placeholder="VIN123456789"
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
      </div>

      {/* Entry Date & Next Test Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="entry_date" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            תאריך כניסה
          </Label>
          <Input
            id="entry_date"
            type="date"
            value={formData.entry_date}
            onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
            className="h-11 text-right"
            dir="rtl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="next_test_date" className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            תאריך טסט הבא
          </Label>
          <Input
            id="next_test_date"
            type="date"
            value={formData.next_test_date}
            onChange={(e) => setFormData({ ...formData, next_test_date: e.target.value })}
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

      {/* Images Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          תמונות הרכב
        </Label>
        <ImageUploadInput
          onChange={handleImageChange}
          value={images}
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
