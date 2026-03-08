import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Phone, Calendar, Gauge, Fuel, Palette, Settings, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { translateTransmission, translateFuelType, translateColor } from "@/lib/car-translations";
import { useState } from "react";

interface PublicCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  kilometers: number;
  fuel_type: string;
  transmission: string;
  exterior_color: string;
  interior_color: string | null;
  engine_size: string | null;
  description: string;
  image_url: string | null;
  image_urls: string[];
  trim_level: string | null;
  entry_date: string | null;
  next_test_date: string | null;
  ownership_history: string | null;
}

interface CarDetailModalProps {
  car: PublicCar | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showPrices: boolean;
  onWhatsAppClick: (car: PublicCar) => void;
  formatPrice: (price: number) => string;
  formatKilometers: (km: number) => string;
}

export function CarDetailModal({ car, open, onOpenChange, showPrices, onWhatsAppClick, formatPrice, formatKilometers }: CarDetailModalProps) {
  const [imgIndex, setImgIndex] = useState(0);

  if (!car) return null;

  const images = car.image_urls?.length ? car.image_urls : car.image_url ? [car.image_url] : [];

  const specs = [
    { icon: Calendar, label: "שנה", value: car.year.toString() },
    { icon: Gauge, label: "קילומטראז׳", value: `${formatKilometers(car.kilometers)} ק״מ` },
    car.fuel_type && { icon: Fuel, label: "דלק", value: translateFuelType(car.fuel_type) },
    car.transmission && { icon: Settings, label: "תיבת הילוכים", value: translateTransmission(car.transmission) },
    car.exterior_color && { icon: Palette, label: "צבע חיצוני", value: translateColor(car.exterior_color) },
    car.interior_color && { icon: Palette, label: "צבע פנימי", value: translateColor(car.interior_color) },
    car.engine_size && { icon: Info, label: "נפח מנוע", value: `${car.engine_size} סמ״ק` },
    car.ownership_history && { icon: Info, label: "בעלות", value: `יד ${car.ownership_history}` },
    car.trim_level && { icon: Info, label: "רמת גימור", value: car.trim_level },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" dir="rtl">
        <DialogTitle className="sr-only">{car.make} {car.model} {car.year}</DialogTitle>
        
        {/* Gallery */}
        {images.length > 0 && (
          <div className="relative aspect-[16/10] bg-[#f5f5f7]">
            <img
              src={images[imgIndex]}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIndex(i => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-all"
                >
                  <ChevronRight className="h-4 w-4 text-[#1d1d1f]" />
                </button>
                <button
                  onClick={() => setImgIndex(i => (i + 1) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-all"
                >
                  <ChevronLeft className="h-4 w-4 text-[#1d1d1f]" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImgIndex(idx)}
                      className={`h-2 rounded-full transition-all ${idx === imgIndex ? 'w-5 bg-white' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
            {/* Price badge on image */}
            {showPrices && (
              <div className="absolute bottom-3 right-3 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/40 shadow-lg">
                <span className="text-lg font-bold" style={{ color: 'var(--brand-color, #0071e3)' }}>
                  {formatPrice(car.price)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
              {car.make} {car.model}
            </h2>
            <p className="text-[#86868b] text-sm mt-1">
              {car.year}{car.trim_level ? ` · ${car.trim_level}` : ''}
            </p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f5f5f7]">
                <spec.icon className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--brand-color, #0071e3)' }} />
                <div className="min-w-0">
                  <p className="text-[11px] text-[#86868b]">{spec.label}</p>
                  <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {car.description && (
            <div>
              <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1.5">תיאור</h3>
              <p className="text-[13px] text-[#86868b] leading-relaxed">{car.description}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => onWhatsAppClick(car)}
            className="w-full h-12 rounded-full text-white text-[15px] font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--brand-color, #0071e3)' }}
          >
            <Phone className="h-4 w-4" />
            {showPrices ? 'צור קשר' : 'לפרטים ומחיר'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
