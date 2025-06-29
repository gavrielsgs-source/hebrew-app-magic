
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "@/types/car";
import { useUpdateCar } from "@/hooks/cars/use-update-car";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check } from "lucide-react";

interface CarStatusChangerProps {
  car: Car;
  compact?: boolean;
}

export function CarStatusChanger({ car, compact = false }: CarStatusChangerProps) {
  const [isChanging, setIsChanging] = useState(false);
  const updateCar = useUpdateCar();

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'זמין';
      case 'sold':
        return 'נמכר';
      case 'reserved':
        return 'שמור';
      default:
        return 'לא ידוע';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === car.status) {
      setIsChanging(false);
      return;
    }

    try {
      await updateCar.mutateAsync({
        id: car.id,
        make: car.make,
        model: car.model,
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
        status: newStatus,
        agency_id: car.agency_id,
        entry_date: car.entry_date,
        license_number: car.license_number,
        chassis_number: car.chassis_number,
        next_test_date: car.next_test_date,
      });

      toast.success("סטטוס הרכב עודכן בהצלחה");
      setIsChanging(false);
    } catch (error) {
      console.error("Error updating car status:", error);
      toast.error("שגיאה בעדכון סטטוס הרכב");
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {!isChanging ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsChanging(true)}
            className="h-8 px-2"
          >
            <Badge className={`${getStatusColor(car.status)} font-medium px-2 py-1 rounded-full`}>
              {getStatusText(car.status)}
            </Badge>
            <ChevronDown className="h-3 w-3 mr-1" />
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Select value={car.status || 'available'} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">זמין</SelectItem>
                <SelectItem value="reserved">שמור</SelectItem>
                <SelectItem value="sold">נמכר</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChanging(false)}
              className="h-8 w-8 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">סטטוס:</span>
        <Badge className={`${getStatusColor(car.status)} font-medium px-3 py-1 rounded-full`}>
          {getStatusText(car.status)}
        </Badge>
      </div>
      <Select value={car.status || 'available'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר סטטוס" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="available">זמין</SelectItem>
          <SelectItem value="reserved">שמור</SelectItem>
          <SelectItem value="sold">נמכר</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
