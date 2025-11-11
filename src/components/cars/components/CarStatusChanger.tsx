
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car } from "@/types/car";
import { useUpdateCar } from "@/hooks/cars/use-update-car";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Check, X, Loader2 } from "lucide-react";

interface CarStatusChangerProps {
  car: Car;
  compact?: boolean;
}

export function CarStatusChanger({ car, compact = false }: CarStatusChangerProps) {
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const updateCar = useUpdateCar();

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'sold':
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
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

    setIsLoading(true);
    try {
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
        status: newStatus,
        agency_id: car.agency_id || null,
        entry_date: car.entry_date,
        license_number: car.license_number,
        chassis_number: car.chassis_number,
        next_test_date: car.next_test_date,
        purchase_cost: car.purchase_cost || null,
        purchase_date: car.purchase_date || null,
        supplier_name: car.supplier_name || null,
      });

      toast.success("סטטוס הרכב עודכן בהצלחה");
      setIsChanging(false);
    } catch (error) {
      console.error("Error updating car status:", error);
      toast.error("שגיאה בעדכון סטטוס הרכב");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsChanging(false);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {!isChanging ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsChanging(true)}
            className="h-auto p-0 hover:bg-transparent"
            disabled={isLoading}
          >
            <Badge className={`${getStatusColor(car.status)} font-medium px-3 py-1 rounded-full transition-all duration-200 cursor-pointer hover:shadow-md`}>
              <span className="ml-1">{getStatusText(car.status)}</span>
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1" />
              )}
            </Badge>
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
            <Select 
              value={car.status || 'available'} 
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-28 border-0 focus:ring-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl" className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="available" className="text-right hover:bg-green-50">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    זמין
                  </span>
                </SelectItem>
                <SelectItem value="reserved" className="text-right hover:bg-yellow-50">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    שמור
                  </span>
                </SelectItem>
                <SelectItem value="sold" className="text-right hover:bg-gray-50">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    נמכר
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">סטטוס:</span>
        <Badge className={`${getStatusColor(car.status)} font-medium px-3 py-1 rounded-full`}>
          {getStatusText(car.status)}
        </Badge>
      </div>
      <Select 
        value={car.status || 'available'} 
        onValueChange={handleStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="בחר סטטוס" />
        </SelectTrigger>
        <SelectContent dir="rtl" className="bg-white border border-gray-200 shadow-lg">
          <SelectItem value="available" className="text-right hover:bg-green-50">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              זמין
            </span>
          </SelectItem>
          <SelectItem value="reserved" className="text-right hover:bg-yellow-50">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              שמור
            </span>
          </SelectItem>
          <SelectItem value="sold" className="text-right hover:bg-gray-50">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              נמכר
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
