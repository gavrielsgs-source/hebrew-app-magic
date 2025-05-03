
import { LeadStatusBadge } from "../utils/lead-status";
import { LeadScoreIndicator } from "./LeadScoreIndicator";  // הוספנו את הקומפוננטה החדשה

interface LeadCardHeaderProps {
  lead: any;
}

export function LeadCardHeader({ lead }: LeadCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{lead.name}</h3>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <LeadScoreIndicator leadId={lead.id} />  {/* הוספת מחוון הדירוג */}
        <LeadStatusBadge status={lead.status} />
      </div>
    </div>
  );
}
