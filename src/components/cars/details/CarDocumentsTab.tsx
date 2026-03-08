import { useDocuments } from "@/hooks/use-documents";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface CarDocumentsTabProps {
  carId: string;
  ownerCustomerId?: string | null;
}

export function CarDocumentsTab({ carId, ownerCustomerId }: CarDocumentsTabProps) {
  const { documents: carDocuments, isLoading: loadingCarDocs } = useDocuments("car", carId);
  const { user } = useAuth();

  // Find all linked customer IDs via sales and purchases
  const { data: linkedCustomerIds = [], isLoading: loadingLinks } = useQuery({
    queryKey: ['car-linked-customers', carId],
    queryFn: async () => {
      if (!user) return [];
      const ids = new Set<string>();
      
      // Add owner if exists
      if (ownerCustomerId) ids.add(ownerCustomerId);

      // Check sales (buyer)
      const { data: sales } = await supabase
        .from('customer_vehicle_sales')
        .select('customer_id')
        .eq('car_id', carId);
      sales?.forEach(s => ids.add(s.customer_id));

      // Check purchases (buyer from dealer)
      const { data: purchases } = await supabase
        .from('customer_vehicle_purchases')
        .select('customer_id')
        .eq('car_id', carId);
      purchases?.forEach(p => ids.add(p.customer_id));

      return Array.from(ids);
    },
    enabled: !!user,
  });

  // Fetch customer documents for all linked customers
  const { data: customerDocuments = [], isLoading: loadingCustomerDocs } = useQuery({
    queryKey: ['car-customer-documents', linkedCustomerIds],
    queryFn: async () => {
      if (linkedCustomerIds.length === 0 || !user) return [];
      const { data, error } = await supabase
        .from('customer_documents')
        .select('*')
        .in('customer_id', linkedCustomerIds)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching customer documents:', error);
        return [];
      }
      return data || [];
    },
    enabled: linkedCustomerIds.length > 0 && !!user,
  });

  const isLoading = loadingCarDocs || loadingLinks || loadingCustomerDocs;

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  const hasCarDocs = carDocuments.length > 0;
  const hasCustomerDocs = customerDocuments.length > 0;

  if (!hasCarDocs && !hasCustomerDocs) {
    return (
      <div className="text-center py-12" dir="rtl">
        <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium">אין מסמכים מקושרים לרכב זה</p>
        <p className="text-sm text-muted-foreground/70 mt-1">מסמכים שיקושרו לרכב או ללקוח יופיעו כאן</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Car documents */}
      {hasCarDocs && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">מסמכי רכב</h4>
          {carDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  {doc.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.created_at), "d/M/yyyy", { locale: he })}
                    </p>
                  )}
                </div>
              </div>
              {doc.url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Customer documents */}
      {hasCustomerDocs && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">מסמכי לקוח</h4>
          {customerDocuments.map((doc: any) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} • {doc.document_number}
                    {doc.date && ` • ${format(new Date(doc.date), "d/M/yyyy", { locale: he })}`}
                  </p>
                </div>
              </div>
              {doc.amount && (
                <span className="text-sm font-medium">₪{doc.amount.toLocaleString()}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
