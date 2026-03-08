import { useCustomer } from "@/hooks/customers/use-customer";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRound, Phone, Mail, MapPin, CreditCard } from "lucide-react";

interface CarOwnerTabProps {
  ownerCustomerId: string | null;
  carId?: string;
}

export function CarOwnerTab({ ownerCustomerId, carId }: CarOwnerTabProps) {
  const { data: customer, isLoading } = useCustomer(ownerCustomerId || "");

  if (!ownerCustomerId) {
    return (
      <div className="text-center py-12" dir="rtl">
        <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
          <UserRound className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium">לא קושר לקוח לרכב זה</p>
        <p className="text-sm text-muted-foreground/70 mt-1">ניתן לקשר לקוח דרך עריכת הרכב</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-40" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-muted-foreground" dir="rtl">
        <p>לקוח לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-right">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">שם מלא</span>
          <span className="font-medium text-sm">{customer.full_name}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">טלפון</span>
          <span className="font-medium text-sm" dir="ltr">{customer.phone || "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">אימייל</span>
          <span className="font-medium text-sm">{customer.email || "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">ת.ז / ח.פ</span>
          <span className="font-medium text-sm">{customer.id_number || "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">כתובת</span>
          <span className="font-medium text-sm">{customer.address || "-"}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">עיר</span>
          <span className="font-medium text-sm">{customer.city || "-"}</span>
        </div>
      </div>
    </div>
  );
}
