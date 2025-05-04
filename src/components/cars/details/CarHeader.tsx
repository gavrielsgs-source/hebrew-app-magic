
import { formatPrice } from "@/lib/utils";
import { CarStatusBadge } from "./CarStatusBadge";

interface CarHeaderProps {
  make: string;
  model: string;
  year: number;
  price: number;
  status: string | null;
}

export function CarHeader({ make, model, year, price, status }: CarHeaderProps) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {make} {model} {year}
        </h2>
        <CarStatusBadge status={status} />
      </div>
      
      <div className="text-2xl font-bold mt-2 text-primary">
        {formatPrice(price)}
      </div>
    </div>
  );
}
