import { Car } from "@/types/car";
import { translateTransmission, translateFuelType, translateColor } from "@/lib/car-translations";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface CarGeneralTabProps {
  car: Car;
}

function formatDate(date: string | null) {
  if (!date) return "-";
  try {
    return format(new Date(date), "d MMMM yyyy", { locale: he });
  } catch {
    return date;
  }
}

function DetailRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{value ?? "-"}</span>
    </div>
  );
}

function translateCarType(value: string | null | undefined): string {
  if (!value) return "-";
  const map: Record<string, string> = {
    regular: "רגיל",
    commercial: "מסחרי",
    truck: "משאית",
    motorcycle: "אופנוע",
    other: "אחר",
  };
  return map[value] || value;
}

function translateOrigin(value: string | null | undefined): string {
  if (!value) return "-";
  const map: Record<string, string> = {
    local: "מקומי",
    import: "יבוא",
    parallel_import: "יבוא מקביל",
    company: "חברה",
  };
  return map[value] || value;
}

export function CarGeneralTab({ car }: CarGeneralTabProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4 text-right" dir="rtl">
      <DetailRow label="סוג" value={translateCarType(car.car_type)} />
      <DetailRow label="תאריך כניסה" value={formatDate(car.entry_date)} />
      <DetailRow label="מספר רישוי" value={car.license_number} />
      <DetailRow label="שנת עלייה לכביש" value={car.registration_year} />

      <DetailRow label="יצרן" value={car.make} />
      <DetailRow label="דגם" value={car.model} />
      <DetailRow label="רמת גימור" value={car.trim_level} />
      <DetailRow label="שנה" value={car.year} />

      <DetailRow label="קילומטראז'" value={car.kilometers?.toLocaleString()} />
      <DetailRow label="סוג מנוע" value={translateFuelType(car.fuel_type)} />
      <DetailRow label="נפח מנוע" value={car.engine_size} />
      <DetailRow label="תיבת הילוכים" value={translateTransmission(car.transmission)} />

      <DetailRow label="צבע חיצוני" value={translateColor(car.exterior_color)} />
      <DetailRow label="צבע פנימי" value={translateColor(car.interior_color)} />
      <DetailRow label="מקוריות" value={translateOrigin(car.origin_type)} />
      <DetailRow label="יד" value={car.ownership_history} />

      <DetailRow label="מספר שילדה" value={car.chassis_number} />
      <DetailRow label="מספר מנוע" value={car.engine_number} />
      <DetailRow label="טסט אחרון" value={formatDate(car.last_test_date)} />
      <DetailRow label="טסט הבא" value={formatDate(car.next_test_date)} />

      <DetailRow label="רכב משועבד" value={car.is_pledged ? "כן" : "לא"} />
      <DetailRow label="הצג באתר" value={car.show_in_catalog ? "כן" : "לא"} />
      <DetailRow label="קוד דגם" value={car.model_code} />
      <DetailRow label="מחיר לסוחר" value={car.dealer_price?.toLocaleString()} />

      <DetailRow label="מחיר מחירון" value={car.catalog_price?.toLocaleString()} />
      <DetailRow label="ספק" value={car.supplier_name} />

      {car.description && (
        <div className="col-span-full mt-2">
          <span className="text-xs text-muted-foreground">הערות</span>
          <p className="font-medium text-sm mt-0.5">{car.description}</p>
        </div>
      )}
    </div>
  );
}
