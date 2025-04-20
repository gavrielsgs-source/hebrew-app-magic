
import { LeadsSkeleton } from "./grid/LeadsSkeleton";
import { LeadsEmptyState } from "./grid/LeadsEmptyState";
import { LeadCard } from "./grid/LeadCard";

interface LeadsGridProps {
  leads: any[];
  isLoading: boolean;
}

export function LeadsGrid({ leads, isLoading }: LeadsGridProps) {
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
