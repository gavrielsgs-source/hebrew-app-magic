import { useCustomer } from "@/hooks/customers/use-customer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRound } from "lucide-react";

interface CarOwnerTabProps {
  ownerCustomerId: string | null;
  carId?: string;
}

function CustomerCard({ customerId, label }: { customerId: string; label: string }) {
  const { data: customer, isLoading } = useCustomer(customerId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-right p-4 rounded-lg border bg-card">
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

export function CarOwnerTab({ ownerCustomerId, carId }: CarOwnerTabProps) {
  // Find buyer via customer_vehicle_sales and customer_vehicle_purchases
  const { data: buyerIds = [], isLoading: loadingBuyers } = useQuery({
    queryKey: ['car-buyers', carId],
    queryFn: async () => {
      if (!carId) return [];
      const ids = new Set<string>();

      const { data: sales } = await supabase
        .from('customer_vehicle_sales')
        .select('customer_id')
        .eq('car_id', carId);
      sales?.forEach(s => ids.add(s.customer_id));

      const { data: purchases } = await supabase
        .from('customer_vehicle_purchases')
        .select('customer_id')
        .eq('car_id', carId);
      purchases?.forEach(p => ids.add(p.customer_id));

      // Remove owner from buyers list to avoid duplication
      if (ownerCustomerId) ids.delete(ownerCustomerId);

      return Array.from(ids);
    },
    enabled: !!carId,
  });

  const hasOwner = !!ownerCustomerId;
  const hasBuyers = buyerIds.length > 0;

  if (!hasOwner && !hasBuyers && !loadingBuyers) {
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

  if (loadingBuyers) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {hasOwner && (
        <CustomerCard customerId={ownerCustomerId!} label="מוכר / בעלים" />
      )}
      {buyerIds.map((buyerId) => (
        <CustomerCard key={buyerId} customerId={buyerId} label="קונה" />
      ))}
    </div>
  );
}
