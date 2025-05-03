
import { Badge } from "@/components/ui/badge"; 
import { getStatusBadgeColor, getStatusText } from "../utils/lead-status";
import { LeadScoreIndicator } from "./LeadScoreIndicator";

export interface LeadCardHeaderProps {
  lead: any;
  hasActiveReminders?: boolean;
}

export function LeadCardHeader({ lead, hasActiveReminders }: LeadCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{lead.name}</h3>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <LeadScoreIndicator leadId={lead.id} />
        <Badge className={getStatusBadgeColor(lead.status)}>
          {getStatusText(lead.status)}
        </Badge>
      </div>
    </div>
  );
}
