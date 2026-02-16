
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Send, Eye } from "lucide-react";
import { CarGridSkeleton } from "./components/CarGridSkeleton";
import { CarGridEmpty } from "./components/CarGridEmpty";
import { getStatusBadgeColor, getStatusText } from "./components/CarStatusBadge";
import { translateTransmission, translateFuelType } from "@/lib/car-translations";

interface CarsGridProps {
  cars: any[];
  isLoading: boolean;
}

export function CarsGrid({ cars, isLoading }: CarsGridProps) {
  if (isLoading) {
    return <CarGridSkeleton />;
  }

  if (!cars.length) {
    return <CarGridEmpty />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <Card key={car.id} className="overflow-hidden">
          <div className="relative h-48 bg-muted">
            {/* Car image would go here */}
            <div className="absolute top-2 right-2">
              <Badge className={getStatusBadgeColor(car.status)}>
                {getStatusText(car.status)}
              </Badge>
            </div>
          </div>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">
              {car.make} {car.model} {car.year}
            </CardTitle>
            <p className="text-lg font-bold">{car.price.toLocaleString()} ₪</p>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-1 text-sm mt-2">
              <span className="text-muted-foreground">ק"מ:</span>
              <span>{car.kilometers.toLocaleString()}</span>
              {car.fuel_type && (
                <>
                  <span className="text-muted-foreground">דלק:</span>
                  <span>{translateFuelType(car.fuel_type)}</span>
                </>
              )}
              {car.transmission && (
                <>
                  <span className="text-muted-foreground">תיבת הילוכים:</span>
                  <span>{translateTransmission(car.transmission)}</span>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-4 flex justify-between">
            <Button size="sm" variant="outline">
              צפה בפרטים
            </Button>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                <Send className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
