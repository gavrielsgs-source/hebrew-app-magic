import { useDocuments } from "@/hooks/use-documents";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface CarDocumentsTabProps {
  carId: string;
}

export function CarDocumentsTab({ carId }: CarDocumentsTabProps) {
  const { documents, isLoading } = useDocuments("car", carId);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12" dir="rtl">
        <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground font-medium">אין מסמכים מקושרים לרכב זה</p>
        <p className="text-sm text-muted-foreground/70 mt-1">מסמכים שיקושרו לרכב יופיעו כאן</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" dir="rtl">
      {documents.map((doc) => (
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
  );
}
