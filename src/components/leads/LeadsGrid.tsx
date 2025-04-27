
import { LeadsSkeleton } from "./grid/LeadsSkeleton";
import { LeadsEmptyState } from "./grid/LeadsEmptyState";
import { LeadCard } from "./grid/LeadCard";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LeadsGridProps {
  leads: any[];
  isLoading: boolean;
  error?: Error | null;
}

export function LeadsGrid({ leads, isLoading, error }: LeadsGridProps) {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>שגיאה בטעינת הלקוחות</AlertTitle>
        <AlertDescription>
          {error.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading) {
    return <LeadsSkeleton />;
  }
  
  if (leads.length === 0) {
    return <LeadsEmptyState />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
