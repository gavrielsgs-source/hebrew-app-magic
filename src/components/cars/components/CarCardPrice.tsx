
import { formatPrice } from "@/lib/utils";

interface CarCardPriceProps {
  price: number;
}

export function CarCardPrice({ price }: CarCardPriceProps) {
  return (
    <div className="text-center bg-gradient-to-l from-blue-50 to-white p-4 rounded-xl border border-blue-100">
      <div className="text-2xl md:text-3xl font-bold text-brand-primary">
        {formatPrice(price)}
      </div>
      <div className="text-sm text-muted-foreground mt-1">מחיר מבוקש</div>
    </div>
  );
}
