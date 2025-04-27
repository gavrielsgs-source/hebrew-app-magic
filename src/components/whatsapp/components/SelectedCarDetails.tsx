
import { Car } from "@/types/car";
import { formatPrice } from "@/lib/utils";

interface SelectedCarDetailsProps {
  car: Car;
}

export function SelectedCarDetails({ car }: SelectedCarDetailsProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-2">רכב נבחר:</h3>
      <p className="text-muted-foreground">
        {car.make} {car.model} {car.year} • {formatPrice(car.price)}
      </p>
    </div>
  );
}
